import {NextcloudItem, TreeNode} from './models';

export class NextcloudUtils {
  public static fileIcon(f: NextcloudItem): string {
    const ext = f.basename.replace(/^.*\.([^\.]+)$/, '$1');
    if (ext.match(/pdf/i)) {
      return 'fa fa-file-pdf-o';
    }

    if (ext.match(/(xls|xlsx|ods)/i)) {
      return 'fa fa-file-excel-o';
    }

    if (ext.match(/(png|jpg|jpeg|bmp|gif)/i)) {
      return 'fa fa-file-image-o';
    }

    if (ext.match(/(doc|docx|odt)/i)) {
      return 'fa fa-file-word-o';
    }

    return 'fa fa-file-o';
  }

  public static toTreeNode(src: NextcloudItem, forFiles: boolean = true): TreeNode {
    return <TreeNode> {
      label: src.basename,
      leaf: src.type == 'file',
      data: src,
      selectable: true,
      collapsedIcon: src.type == 'file' ? 'document-outline' : 'folder-outline',
      expandedIcon: 'fa fa-folder-open-o',
    }
  }

  public static parentFolder(path: string): TreeNode {
    return {
      collapsedIcon: 'folder-outline',
      selectable: false,
      leaf: false,
      data: <NextcloudItem>{
        type: 'directory',
        size: 0,
        filename: path.replace(/^(.*)\/[^\/]+$/, '$1'),
      },
      label: '..', 
    }
  }
}
