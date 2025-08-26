const vscode = require("vscode");

function getNonce() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 16; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
class GgbCustomDocument {
  constructor(uri) {
    this.uri = uri;
    this.content = "";
  }
  dispose() {}
}
/**
 * extends CustomEditorProvider
 */
class GgbEditorProvider {

  static register(context) {
    return vscode.window.registerCustomEditorProvider(
      "ggbview.ggbView", // 编辑器ID，需在package.json中配置
      new GgbEditorProvider(context),
      {
        supportsMultipleEditorsPerDocument: true,
        webviewOptions: {
          retainContextWhenHidden: true,
        },
      }
    );
  }
  constructor(context,log) {
    console.log("constructor ggbview.ggbView");
    this.context = context;
    this.log = log;
  }
  

  // 打开文档
  async openCustomDocument(uri) {
    const document = new GgbCustomDocument(uri);
    // 读取ZIP包内容逻辑
    return document;
  }

  // 解析编辑器
  async resolveCustomEditor(document, webviewPanel) {
    this.log.appendLine("resolveCustomEditor(document, webviewPanel) ggbview.ggbView");

    const fileName = document.uri.path.split("/").pop();

    webviewPanel.title = fileName;
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(
          document.uri.fsPath.substring(0, document.uri.fsPath.lastIndexOf("/"))
        ),
      ],
    };

    webviewPanel.webview.html = this.getHtmlContent(document, webviewPanel);

  }

  // 获取Webview内容
  getHtmlContent(document, webviewPanel) {
    console.log("getHtmlContent(document, webviewPanel) ggbview.ggbView");
    // 这里怎么获取在vscode配置后的值
    const config = vscode.workspace.getConfiguration("ggbview");
    this.log.appendLine(`configuration.has.showToolBar: ${config.has("ggbview.default.showToolBar")}`);
    this.log.appendLine(`configuration.has.showToolBar: ${config.has("default.showToolBar")}`);
    this.log.appendLine(`configuration.has.showToolBar: ${config.has("showToolBar")}`);

    const showToolBar = config.get('default.showToolBar');
    const showMenuBar = config.get('default.showMenuBar');
    const showAlgebraInput = config.get('default.showAlgebraInput');
    const allowStyleBar = config.get('default.allowStyleBar');
    const showToolBarHelp = config.get('default.showToolBarHelp');
    this.log.appendLine(`showToolBar: ${showToolBar}`);
    this.log.appendLine(`showMenuBar: ${showMenuBar }`);
    this.log.appendLine(`showAlgebraInput: ${showAlgebraInput }`);

    // const packageJson = require(this.context.asAbsolutePath("package.json"));
    // const properties = packageJson.contributes.configuration.properties;
    // const showToolBar = properties["ggbview.default.showToolBar"];
    // const showMenuBar = properties["ggbview.default.showMenuBar"];
    // const showAlgebraInput = properties["ggbview.default.showAlgebraInput"];

    // this.log.appendLine(`showToolBar: ${showToolBar.value}`);
    // this.log.appendLine(`showMenuBar: ${showMenuBar.value}`);
    // this.log.appendLine(`showAlgebraInput: ${showAlgebraInput.value}`);

    const fileUri = webviewPanel.webview.asWebviewUri(document.uri);
    return `<!DOCTYPE html>
	<html>
	  <head>
		<script
		  type="text/javascript"  
		  src="https://www.geogebra.org/apps/deployggb.js"
		></script>
	  </head>
	  <body>
		<div id="ggbcontainer"></div>
		<script type="text/javascript"  >
		  var parameters = {
			fileName: "${fileUri.toString()}",
			showToolBar: ${showToolBar},
			showMenuBar: ${showMenuBar},
			showAlgebraInput: ${showAlgebraInput},
      allowStyleBar: ${allowStyleBar},
      showToolBarHelp: ${showToolBarHelp},
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
  }
}

module.exports = {GgbEditorProvider,getNonce};
