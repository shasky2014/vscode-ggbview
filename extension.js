const vscode = require("vscode");

const { GgbTreeDataProvider, openFile } = require("./ggbTreeDataProvider");
const {GgbEditorProvider} = require("./editorProvider");
const log = vscode.window.createOutputChannel("GGB View");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  log.appendLine('Congratulations, your extension "ggbview" is now active!');

  const pickggb = vscode.commands.registerCommand("ggbview.pickFile", (uri) => {
    if (uri && (uri.fsPath.endsWith(".ggb") || uri.fsPath.endsWith(".ggt"))) {
      vscode.window.showInformationMessage(`Pick GGB file: ${uri.fsPath}`);
      treeDataProvider.setUri(uri);
    }
  });
  context.subscriptions.push(pickggb);

  const opendefault = vscode.window.registerCustomEditorProvider(
    "ggbview.ggbView",
    new GgbEditorProvider(context,log),
    {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
    }
  );
  context.subscriptions.push(opendefault);

  const opencmd = vscode.commands.registerCommand("ggbview.open", (uri) => {
    vscode.commands.executeCommand('vscode.openWith', uri, 'ggbview.ggbView');
  });
  context.subscriptions.push(opencmd);

  const treeDataProvider = new GgbTreeDataProvider();
  const explorer_tree = vscode.window.createTreeView("ggbfilelist", {
    treeDataProvider: treeDataProvider,
  });

  context.subscriptions.push(explorer_tree);

  const openggbsubfile = vscode.commands.registerCommand(
    "ggbview.openFile",
    (ggbUri, filePath) => {
      openFile(ggbUri, filePath);
      // vscode.window.showInformationMessage(`${filePath}`);
    }
  );
  context.subscriptions.push(openggbsubfile);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};

/*
## 关于发布更新

- 发布前需要先获取azure的token，[azure-token管理](https://dev.azure.com/wchenchen/_usersSettings/tokens?)
- [安装量查看](https://marketplace.visualstudio.com/manage/publishers/neon-light)

## 插件开发文档

- [插件开发文档](https://code.visualstudio.com/api/extension-guides/custom-editors#custom-editor)

*/
