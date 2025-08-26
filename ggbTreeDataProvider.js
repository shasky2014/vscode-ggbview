const vscode = require('vscode');
const JSZip = require('jszip');

class GgbTreeDataProvider {
    constructor() {
        this.currentUri = null;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }

    setUri(uri) {
        this.currentUri = uri;
        this._onDidChangeTreeData.fire();
    }

    async getChildren() {
        if (!this.currentUri) {
            return [new vscode.TreeItem('请选择一个.ggb文件')];
        }

        try {
            // 读取并解析ggb文件
            const fileContent = await vscode.workspace.fs.readFile(this.currentUri);
            const zip = await JSZip.loadAsync(fileContent);

            // 生成文件列表树节点
            return Object.keys(zip.files)
                .filter(path => !zip.files[path].dir) // 过滤目录
                .map(path => {
                    const treeItem = new vscode.TreeItem(path);
                    treeItem.command = {
                        command: 'ggbview.openFile',
                        title: '打开文件',
                        arguments: [this.currentUri, path]
                    };
                    return treeItem;
                });
        } catch (error) {
            return [new vscode.TreeItem(`解析失败: ${error.message}`)];
        }
    }

    getTreeItem(element) {
        return element;
    }
}

async function openFile(ggbUri, filePath) {
    try {
        const ggbfile = await vscode.workspace.fs.readFile(ggbUri);
        const ggbfilezip = await JSZip.loadAsync(ggbfile);
        const ggbsubfile = ggbfilezip.file(filePath);

        if (!ggbsubfile) {
            vscode.window.showErrorMessage(`无法找到文件: ${filePath}`);
            return;
        }

        // 判断文件类型
        if (filePath.toLowerCase().endsWith('.png')) {
            // 处理PNG图片
            const content = await ggbsubfile.async('arraybuffer');
            const base64Content = Buffer.from(content).toString('base64');
            // 创建webview面板显示图片
            const panel = vscode.window.createWebviewPanel(
                'imageViewer',
                filePath,
                vscode.ViewColumn.One,
                {}
            );
            
            panel.webview.html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${filePath}</title>
                    <style>
                        body {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            background-color: #f0f0f0;
                        }
                        img {
                            max-width: 100%;
                            max-height: 100%;
                        }
                    </style>
                </head>
                <body>
                    <img src="data:image/png;base64,${base64Content}" />
                </body>
                </html>
            `;
        } else {
            // 处理文本文件
            const content = await ggbsubfile.async('string');
            const document = await vscode.workspace.openTextDocument({
                content: content
            });
            await vscode.window.showInformationMessage(`打开:${ggbUri}:${ggbsubfile.name}`);
            await vscode.window.showTextDocument(document, { preview: true });
        }
    } catch (error) {
        vscode.window.showErrorMessage(`打开文件失败: ${error.message}`);
    }
}

module.exports = {GgbTreeDataProvider,openFile};