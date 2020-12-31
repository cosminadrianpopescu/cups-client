export class Storage {
  private static _baseUrl: string = window.location.href.replace(/^(.*)\/js(\/index.html)?.*$/, '$1');
  private static _url: string = `${Storage._baseUrl}/api/0.1/store`;

  public static async get(arg: {key: string}): Promise<{value: string}> {
    const response = await fetch(`${Storage._url}/${arg.key}`);
    const txt = await response.text();
    return {value: JSON.parse(txt)};
  }

  public static async set(arg: {key: string, value: string}): Promise<void> {
    const data = new FormData();
    data.set('key', arg.key);
    data.set('value', arg.value);
    await fetch(`${Storage._url}`, {method: 'POST', body: data});
  }
}
