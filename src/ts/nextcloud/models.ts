export class NextcloudPoll {
  token: string;
  endpoint: string;
}

export class NextcloudLogin {
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
  lastmod: Date;
  size: number;
  type: 'file' | 'directory';
  mime?: string;
  etag: string;
  props: Object;
}

export class TreeNode {
  expanded?: boolean;
  partialSelected?: boolean;
  children?: Array<TreeNode>;
  label: string;
  leaf: boolean;
  data: any;
  selectable: boolean;
  collapsedIcon: string;
  expandedIcon?: string;
}
