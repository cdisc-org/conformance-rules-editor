const yaml = require("js-yaml");

function getCoreId(rule: any) {
  return (rule !== undefined && "CoreId" in rule) ? rule["CoreId"] : `<Rule missing 'CoreId' attribute>`;
}

function getRuleType(rule: any) {
  if (rule !== undefined && "Rule Type" in rule) {
    const ruleType = Object.keys(rule["Rule Type"]);
    if (ruleType.length === 1) {
      return ruleType[0];
    }
  }
  return `<Rule missing 'Rule Type' attribute>`;
}

function getAttributes(body: string) {
  const rule = yaml.load(body);
  return { title: getCoreId(rule), field_rule_type: getRuleType(rule), body: { value: body } };
}

export class DataService {
  public get_rules = async () => {
    return await fetch(`/api/rules`, {
      method: 'GET',
      headers: {
        'Accept': "application/json",
      }
    });
  }

  public get_rule = async (ruleId: string) => {
    return await fetch(`/api/rules/${ruleId}`, {
      method: 'GET',
      headers: {
        'Accept': "application/json",
      }
    });
  }

  public patch_rule = async (ruleId: string, body: string) => {
    return await fetch(`/api/rules/${ruleId}`, {
      method: 'PATCH',
      headers: {
        'Accept': "application/json",
      },
      body: JSON.stringify({ data: { id: ruleId, type: "node--rule", attributes: getAttributes(body) } })
    });
  }

  public post_rule = async (body: string) => {
    return await fetch(`/api/rules`, {
      method: 'POST',
      headers: {
        'Accept': "application/json",
      },
      body: JSON.stringify({ data: { type: "node--rule", attributes: getAttributes(body) } })
    });
  }

  public delete_rule = async (ruleId: string) => {
    return await fetch(`/api/rules/${ruleId}`, {
      method: 'DELETE',
      headers: {
        'Accept': "application/json",
      }
    });
  }

}
