## version 

### 0.0.6
- 增加扩展项可配置参数，来控制ggb页面是否显示工具栏和菜单等相关内容
  - showToolBar 显示工具栏
  - showMenuBar 显示菜单按钮
  - showToolBarHelp 显示工具帮助信息弹窗
  - allowStyleBar 允许样式栏
  - showAlgebraInput 显示命令输入栏
相关配置使用 new GGBApplet(parameters, true) 对应的参数列表，更多的配置有待进一步研究。

### 0.0.5
- 新增提示信息，第一次使用 ggbview时，需要设置打开方式为 "GeoGebra View"，方便以后打开ggb文件
     
### 0.0.3
- 增加功能: 选择 "GGB:Pick File" 命令，在编辑窗口打开可以操作的ggb文件，暂时不支持编辑保存

### 0.0.2
- 修改bug，优化逻辑

### 0.0.1
- 在vscode 的`OUTPUT - GGB View` 里查看ggbview的运行日志
- 在资源管理器中预览 .ggb 和 .ggt 文件内容
- 浏览 GeoGebra 文件内部结构
- 直接查看包内的图片和文本文件
