import yaml from "js-yaml";
import { IDataset } from "../utils/ExcelDataset";

export interface ISchema {
  standard: string;
  id: string;
  uri: string;
  url: string;
  json?: {};
}

function getCoreId(rule: any) {
  const errorMessage = `<Missing 'Core.Id'>`;
  return isValidYaml(rule)
    ? rule?.["Core"]?.["Id"] ??
        /* For back compatibility: */ rule?.["CoreId"] ??
        errorMessage
    : errorMessage;
}

function getRuleType(rule: any) {
  return isValidYaml(rule) && typeof rule["Rule Type"] === "string"
    ? rule["Rule Type"]
    : `<Missing 'Rule Type'>`;
}

function isValidYaml(rule: any) {
  return rule !== undefined && rule !== null && typeof rule === "object";
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
  getAttributes = (body: string) => {
    const rule = (() => {
      try {
        return yaml.load(body);
      } catch (yamlException) {
        return undefined;
      }
    })();
    return {
      title: getCoreId(rule),
      field_conformance_rule_type: getRuleType(rule),
      body: { value: body },
    };
  };

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

  public get_rules_filter_sort = async (fetchParams: string) => {
    /* If multiple requests are fired in succession, 
      avoid race conditions by aborting all but the most recent request's response */
    this.rulesAbortController.abort();
    this.rulesAbortController = new AbortController();
    return fetch(`/api/rules?${fetchParams}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: this.rulesAbortController.signal,
    })
      .then((response: Response) => response.json())
      .then((responseJson) => {
        return JSON.parse(responseJson.body);
      });
  };

  public get_rules_pagination = async (fetchParams: string) => {
    return fetch(`/api/rules?${fetchParams}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      /* Allows us to abort the pagination request if a pagination request is started
       and then a filter/sort request starts before we receive the pagination response */
      signal: this.rulesAbortController.signal,
    })
      .then((response: Response) => response.json())
      .then((responseJson) => {
        return JSON.parse(responseJson.body);
      });
  };

  public get_rule = async (ruleId: string) => {
    return await fetch(`/api/rules/${ruleId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  };

  public patch_rule = async (ruleId: string, body: string) => {
    return await fetch(`/api/rules/${ruleId}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
      },
      body: JSON.stringify({
        data: {
          id: ruleId,
          type: "node--conformance_rule",
          attributes: this.getAttributes(body),
        },
      }),
    });
  };

  public set_rule_published = async (ruleId: string, published: boolean) => {
    return await fetch(`/api/rules/${ruleId}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
      },
      body: JSON.stringify({
        data: {
          id: ruleId,
          type: "node--conformance_rule",
          attributes: {
            status: published,
          },
        },
      }),
    });
  };

  public post_rule = async (body: string) => {
    return await fetch(`/api/rules`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: JSON.stringify({
        data: {
          type: "node--conformance_rule",
          attributes: {
            ...this.getAttributes(body),
            field_conformance_rule_creator: await this.get_username(),
            status: false,
          },
        },
      }),
    });
  };

  public delete_rule = async (ruleId: string) => {
    return await fetch(`/api/rules/${ruleId}`, {
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
      {
        standard: "sdtm",
        id: "https://cdisc.org/CORE-sdtm.json",
        uri: "file:///CORE-sdtm.json",
        url: "schema/CORE-sdtm.json",
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

  public generate_rule_json = async (rule: string) => {
    return await fetch(`/api/rules/generate`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: JSON.stringify({
        definition: rule,
      }),
    }).then(async function (response: Response) {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new DataServiceError(response);
      }
    });
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
