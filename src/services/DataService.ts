
export class DataService {
    public get_rules= async (): Promise<Object> => {
        const result = await fetch(`/api/rules`, {
            method: 'GET',
            headers: {
              'Accept': "application/json",
            }
          });
        return await result.json()
    }
}