import yaml from "js-yaml";
import { IDataset } from "../utils/ExcelDataset";

function getCoreId(rule: any) {
  return isValidYaml(rule) && "CoreId" in rule
    ? rule["CoreId"]
    : `<Missing 'CoreId'>`;
}

function getRuleType(rule: any) {
  if (isValidYaml(rule) && "Rule Type" in rule) {
    const ruleType = Object.keys(rule["Rule Type"]);
    if (ruleType.length === 1) {
      return ruleType[0];
    }
  }
  return `<Missing 'Rule Type'>`;
}

function isValidYaml(rule: any) {
  return rule !== undefined && rule !== null && typeof rule === "object";
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

  public get_rules = async (fetchParams: string) => {
    return await fetch(`/api/rules?${fetchParams}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
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

  public get_rules_schema = async () => {
    return await fetch("schema/RulesSchema.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }).then(function (response) {
      return response.json();
    });
  };

  public generate_rule_json = async (rule: string) => {
    return await fetch(
      "https://cdisc-library-conformance-rules-generator-dev.azurewebsites.net/api/RulesGeneratorHttp?code=R90KWQElkx9QNcGEe36ljBNXptC9kodb769EIaDMCHXhDNCaaVENwQ==",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: JSON.stringify({
          definition: rule,
        }),
      }
    ).then(function (response) {
      if (response.status === 200) {
        return response.json();
      } else {
        throw response.statusText;
      }
    });
  };

  public test_rule = async (rule: object, datasets: IDataset[]) => {
    return await fetch(
      "https://core-engine-func-dev.azurewebsites.net/api/rule_test_function?code=ALd1IfA3llqASuqeKaca1St3hwmk0bdLqnuLxERcXG6ImEUQY4qHEw==",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: JSON.stringify({
          rule: rule,
          datasets: datasets,
        }),
      }
    ).then(function (response) {
      if (response.status === 200) {
        return response.json();
      } else {
        throw response.statusText;
      }
    });
  };
}
