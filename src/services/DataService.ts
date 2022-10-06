import { IQuery } from "../types/IQuery";
import { IRule } from "../types/IRule";
import { IRules } from "../types/IRules";
import { IDataset } from "../utils/ExcelDataset";

export interface ISchema {
  standard: string;
  id: string;
  uri: string;
  url: string;
  json?: {};
}

function responseHasJson(response: Response) {
  const contentType = response.headers.get("content-type");
  return contentType && contentType.includes("application/json");
}

function DataServiceError(response: Response) {
  this.message = `Results - Fail: ${response.status} - ${response.statusText}`;
  this.details = responseHasJson(response) ? response.json() : response.text();
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

  public get_username = async () => {
    return await this.get_me()
      .then(function (response) {
        return response.json();
      })
      .then(function (responseJson) {
        return responseJson.clientPrincipal.userDetails;
      });
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
      body: JSON.stringify({ content: content }),
    }).then((response) => response.json());
  };

  public set_rule_published = async (
    ruleId: string,
    isPublished: boolean
  ): Promise<boolean> => {
    return fetch(`/api/rules/${ruleId}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
      },
      body: JSON.stringify({ isPublished: isPublished }),
    })
      .then((response) => response.json())
      .then((responseJson: IRule) => responseJson.isPublished);
  };

  public post_rule = async (body: string): Promise<string> => {
    return fetch(`/api/rules`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: JSON.stringify({
        content: body,
        creator: await this.get_username(),
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
        uri: "file:///CORE-base.json",
        url: "schema/CORE-base.json",
      },
    ];
    const responses: Response[] = await Promise.all(
      schemas.map(
        (schema: ISchema): Promise<Response> =>
          fetch(schema.url, {
            headers: {
              "Content-Type": "application/json",
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

  public execute_rule = async (rule: object, datasets: IDataset[]) => {
    return await fetch(`/api/rules/execute`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: JSON.stringify({
        rule: rule,
        datasets: datasets,
      }),
    }).then(async function (response: Response) {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new DataServiceError(response);
      }
    });
  };
}
