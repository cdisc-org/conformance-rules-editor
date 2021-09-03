const yaml = require("js-yaml");

function getCoreId(body: string) {
  const rule = yaml.load(body);
  return (rule !== undefined && "CoreId" in rule) ? rule.CoreId : "<Rule missing 'CoreId' attribute>";
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
      body: JSON.stringify({ data: { id: ruleId, type: "node--rule", attributes: { title: getCoreId(body), body: { value: body } } } })
    });
  }

  public post_rule = async (body: string) => {
    return await fetch(`/api/rules`, {
      method: 'POST',
      headers: {
        'Accept': "application/json",
      },
      body: JSON.stringify({ data: { type: "node--rule", attributes: { title: getCoreId(body), body: { value: body } } } })
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
