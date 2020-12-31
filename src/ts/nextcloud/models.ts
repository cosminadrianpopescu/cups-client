import {deserialize} from '../decorators';

export class NextcloudPoll {
  token: string;
  endpoint: string;
}

export class NextcloudLogin {
  @deserialize(NextcloudPoll)
  poll: NextcloudPoll;
  login: string;
}

export class NextcloudCredentials {
  public server: string;
  public loginName: string
  public appPassword: string;
}

export class NextcloudItem {
  filename: string;
  basename: string;
  @deserialize(Date)
  lastmod: Date;
  size: number;
  type: 'file' | 'directory';
  mime?: string;
  etag: string;
  props: Object;
}

export class NextcloudShare {
  url: string;
  id: string;
}

export class NextcloudShareResult {
  ocs: {data: NextcloudShare}
}
