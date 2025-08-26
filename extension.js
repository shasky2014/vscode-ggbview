const vscode = require("vscode");

const { GgbTreeDataProvider, openFile } = require("./ggbTreeDataProvider");
const {GgbEditorProvider,getNonce} = require("./editorProvider");
const log = vscode.window.createOutputChannel("GGB View");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  vscode.window.showInformationMessage(
    "1. 右键点击 `.ggb` 文件\n" +
      "2. 选择 Open With \n" +
      "3. 选择 Configure default editor for '*.ggb' files\n" +
      "4. 选择 GGB View"
  );
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
    new GgbEditorProvider(context),
    {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
    }
  );
  context.subscriptions.push(opendefault);

  const opencmd = vscode.commands.registerCommand("ggbview.open", (uri) => {
    const fileName = uri.path.split("/").pop();

    const panel = vscode.window.createWebviewPanel(
      "ggb-editor",
      fileName,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(uri.fsPath.substring(0, uri.fsPath.lastIndexOf("/"))),
        ],
      }
    );
    const fileUri = panel.webview.asWebviewUri(uri);
    panel.webview.html = `<!DOCTYPE html>
	<html>
	  <head>
		<script
		  type="text/javascript"
		  src="https://www.geogebra.org/apps/deployggb.js"
		></script>
	  </head>
	  <body>
		<div id="ggbcontainer"></div>
		<script type="text/javascript">
		  var parameters = {
			fileName: "${fileUri.toString()}",
		  };
		  console.log(parameters);
		  var applet = new GGBApplet(parameters, true);
		  console.log(applet);
		  window.onload = function () {
			applet.inject(ggbcontainer);
		  };
		</script>
	  </body>
	</html>`;
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
