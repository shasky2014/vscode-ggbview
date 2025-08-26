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
  constructor(context) {
    console.log("constructor ggbview.ggbView");
    this.context = context;
  }
  // 打开文档
  async openCustomDocument(uri) {
    const document = new GgbCustomDocument(uri);
    // 读取ZIP包内容逻辑
    return document;
  }

  // 解析编辑器
  async resolveCustomEditor(document, webviewPanel) {
    console.log("resolveCustomEditor(document, webviewPanel) ggbview.ggbView");

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
    const nonce = getNonce();

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
