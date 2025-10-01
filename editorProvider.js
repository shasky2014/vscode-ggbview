const vscode = require("vscode");

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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
  document = null;

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
  constructor(context, log) {
    console.log("constructor ggbview.ggbView");
    this.context = context;
    this.log = log;
  }

  // 打开文档
  async openCustomDocument(uri) {
    this.document = new GgbCustomDocument(uri);
    // 读取ZIP包内容逻辑
    return this.document;
  }

  async saveCustomDocument(document) {
    this.log.appendLine("saveCustomDocument(", document, ")");
  }
  // 解析编辑器
  async resolveCustomEditor(document, webviewPanel) {
    this.log.appendLine(
      "resolveCustomEditor(document, webviewPanel) ggbview.ggbView"
    );

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
    webviewPanel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case "log":
            this.log.appendLine(message.text);
            return;
          case "save":
            // 当收到保存命令时，调用 saveCustomDocument 方法
            await this.saveCustomDocument(document);
            return;
        }
      },
      undefined,
      this.context.subscriptions
    );

    webviewPanel.webview.html = this.getHtmlContent(document, webviewPanel);
  }

  // 获取Webview内容
  getHtmlContent(document, webviewPanel) {
    console.log("getHtmlContent(document, webviewPanel) ggbview.ggbView");
    // 这里怎么获取在vscode配置后的值
    const config = vscode.workspace.getConfiguration("ggbview");
    this.log.appendLine(
      `configuration.has.showToolBar: ${config.has("ggbview.default.showToolBar")}`
    );
    this.log.appendLine(
      `configuration.has.showToolBar: ${config.has("default.showToolBar")}`
    );
    this.log.appendLine(
      `configuration.has.showToolBar: ${config.has("showToolBar")}`
    );

    const showToolBar = config.get("default.showToolBar");
    const showMenuBar = config.get("default.showMenuBar");
    const showAlgebraInput = config.get("default.showAlgebraInput");
    const allowStyleBar = config.get("default.allowStyleBar");
    const showToolBarHelp = config.get("default.showToolBarHelp");
    this.log.appendLine(`showToolBar: ${showToolBar}`);
    this.log.appendLine(`showMenuBar: ${showMenuBar}`);
    this.log.appendLine(`showAlgebraInput: ${showAlgebraInput}`);

    webviewPanel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "log":
            this.log.appendLine(message.text);
            return;
        }
      },
      undefined,
      this.context.subscriptions
    );

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
    <div id="toolbar">
        <span id="info" style="width: 250px; height: 30px; line-height: 30px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border: 1px solid #ccc; padding: 0 5px;"></span>
        <button id="save">Save</button>
        <button id="format">Format</button>
    </div>

		<div id="ggbcontainer"></div>
		<script type="text/javascript"  >
        const vscode = acquireVsCodeApi();
        function logToVSCode(...args) {
          const text = args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ');
          vscode.postMessage({ command: 'log', text: '[Webview] ' + text });
        }
    document.getElementById('save').addEventListener('click', () => {
        vscode.postMessage({ command: 'save' });
    });

		  var parameters = {
        fileName: "${fileUri.toString()}",
        showToolBar: ${showToolBar},
        showMenuBar: ${showMenuBar},
        showAlgebraInput: ${showAlgebraInput},
        allowStyleBar: ${allowStyleBar},
        showToolBarHelp: ${showToolBarHelp},
		  };

      parameters.appletOnLoad=function(api){
        var info = document.getElementById("info");
        info.innerText = "Steps:"+ api.getConstructionSteps()+"/objects:" +api.getObjectNumber();
      }
      var applet = new GGBApplet(parameters, true);
      window.onload = function () {
        applet.inject("ggbcontainer");
      };
		</script>
	  </body>
	</html>`;
  }
}

module.exports = { GgbEditorProvider, getNonce };
