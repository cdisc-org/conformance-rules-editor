
export class DataService {
    public get_rules= async () => {
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
}