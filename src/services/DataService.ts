import { DetailsType, IResultsDetails } from "../components/AppContext";
import { IQuery } from "../types/IQuery";
import { IRule } from "../types/IRule";
import { IRules } from "../types/IRules";
import { IUser } from "../types/IUser";
import { IDataset } from "../utils/ExcelDataset";

export interface ISchema {
  standard: string;
  id: string;
  uri: string;
  url: string;
  json?: {};
}
//this is a test PR to run preview e2e testing

export interface IDataServiceError extends IResultsDetails {
  message: string;
}

function responseHasJson(response: Response) {
  const contentType = response.headers.get("content-type");
  return contentType && contentType.includes("application/json");
}

async function responseToError(response: Response): Promise<IDataServiceError> {
  const hasJSON = responseHasJson(response);
  return {
    details: await (hasJSON ? response.json() : response.text()),
    detailsType: hasJSON ? DetailsType.json : DetailsType.text,
    message: `Results - Fail: ${response.status} - ${response.statusText}`,
  };
}

function DataServiceError(error: IDataServiceError) {
  this.details = error.details;
  this.detailsType = error.detailsType;
  this.message = error.message;
}

export class DataService {
  public get_me = async () => {
    return await fetch(`/.auth/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  };

  public get_user = async (): Promise<IUser> => {
    const mePromise = this.get_me().then(function (response) {
      return response.json();
    });
    const permissionsPromise = fetch(`/api/permissions`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }).then((response) => response.json());
    const [me, permissions] = await Promise.all([
      mePromise,
      permissionsPromise,
    ]);
    return {
      id: me.clientPrincipal.userId,
      name: me.clientPrincipal.claims.find((claim) => claim.typ === "name")
        ?.val,
      company: me.clientPrincipal.claims.find(
        (claim) => claim.typ === "extension_CompanyName"
      )?.val,
      write_allowed: permissions.write_allowed,
    };
  };

  rulesAbortController = new AbortController();

  public get_rules_filter_sort = async (
    fetchParams: IQuery
  ): Promise<IRules> => {
    /* If multiple requests are fired in succession, 
      avoid race conditions by aborting all but the most recent request's response */
    this.rulesAbortController.abort();
    this.rulesAbortController = new AbortController();
    return fetch(
      `/api/rules?${new URLSearchParams({
        query: JSON.stringify(fetchParams),
      })}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: this.rulesAbortController.signal,
      }
    ).then((response: Response) => response.json());
  };

  public get_rules_pagination = async (
    fetchParams: IQuery
  ): Promise<IRules> => {
    return fetch(
      `/api/rules?${new URLSearchParams({
        query: JSON.stringify(fetchParams),
      })}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        /* Allows us to abort the pagination request if a pagination request is started
       and then a filter/sort request starts before we receive the pagination response */
        signal: this.rulesAbortController.signal,
      }
    ).then((response: Response) => response.json());
  };

  public get_history = async (ruleId: string): Promise<IRule> => {
    return fetch(`/api/history/${ruleId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }).then((response) => response.json());
  };

  public get_rule = async (ruleId: string): Promise<IRule> => {
    return fetch(`/api/rules/${ruleId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }).then((response) => response.json());
  };

  public patch_rule = async (
    ruleId: string,
    content: string
  ): Promise<IRule> => {
    return fetch(`/api/rules/${ruleId}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
      },
      body: JSON.stringify({
        content: content,
        creator: await this.get_user(),
      }),
    }).then((response) => response.json());
  };

  public publish_rule = async (ruleId: string): Promise<IRule> => {
    return fetch(`/api/rules/publish/${ruleId}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
      },
    }).then((response) => response.json());
  };

  public post_rule = async (body: string): Promise<string> => {
    return fetch(`/api/rules`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: JSON.stringify({
        content: body,
        creatorId: (await this.get_user()).id,
      }),
    })
      .then((response) => response.json())
      .then((responseJson) => responseJson.id);
  };

  public delete_rule = async (ruleId: string): Promise<Response> => {
    return fetch(`/api/rules/${ruleId}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });
  };

  public get_rules_schema = async (): Promise<ISchema[]> => {
    const schemas: ISchema[] = [
      {
        standard: "base",
        id: "https://cdisc.org/CORE-base.json",
        uri: `${window.location.href}api/schema`,
        url: "/api/schema",
      },
    ];
    const responses: Response[] = await Promise.all(
      schemas.map(
        (schema: ISchema): Promise<Response> =>
          fetch(schema.url, {
            headers: {
              Accept: "application/json",
            },
          })
      )
    );
    const json: {}[] = await Promise.all(
      responses.map((response: Response) => response.json())
    );
    return schemas.map(
      (schema: ISchema, schemaIndex: number): ISchema => ({
        ...schema,
        json: json[schemaIndex],
      })
    );
  };

  public get_rule_template = async (): Promise<string> => {
    const template = await fetch("/rule_template.yml").then((res) =>
      res.text()
    );
    return template;
  };

  public execute_rule = async (payload: {
    rule: object;
    datasets: IDataset[];
    define_xml?: string;
  }) => {
    return await fetch(`/api/rules/execute`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    }).then(async function (response: Response) {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new DataServiceError(await responseToError(response));
      }
    });
  };
}
