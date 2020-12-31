import {NextcloudItem} from './models';
import {TreeNode} from 'primeng/api/treenode';

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
      collapsedIcon: src.type == 'file' ? NextcloudUtils.fileIcon(src) : 'fa fa-folder-o',
      expandedIcon: 'fa fa-folder-open-o',
    }
  }
}
