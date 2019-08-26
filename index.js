const {ipcRenderer} = require('electron')
const tinymce = require('tinymce/tinymce');
require('tinymce/themes/silver');
require('tinymce/plugins/paste');
require('tinymce/plugins/link');

tinymce.PluginManager.add('menusave', function(editor, url) {
    editor.ui.registry.addMenuItem('menuload', {
        text: 'Open',
        onAction: () => ipcRenderer.send('call-load')
    });
    editor.ui.registry.addMenuItem('menusave', {
        text: 'Save',
        onAction: () => ipcRenderer.send('call-save', tinymce.editors[0].getContent({format: 'raw'}))
    });
    editor.ui.registry.addMenuItem('menusaveas', {
        text: 'Save As',
        onAction: () => ipcRenderer.send('call-saveAs',tinymce.editors[0].getContent({format: 'raw'}))
    });
    editor.ui.registry.addMenuItem('menuquit', {
        text: 'Quit',
        onAction: () => ipcRenderer.send('call-quit')
    });
});

ipcRenderer.on('new-file', function (event, data) {
  tinymce.editors[0].setContent(data);
});

ipcRenderer.on("change-cwd", (event, newPath) =>{
  if (tinymce.activeEditor) {
    var doc = tinymce.activeEditor.getDoc(),
        head = doc.head,
        base;
    if (head.getElementsByTagName("base").length == 0) {
      base = document.createElement("base");
      head.appendChild(base);
    } else {
      base = head.getElementsByTagName("base")[0]
    }
    base.setAttribute("href", "file://" + newPath + "/");
    tinymce.activeEditor.documentBaseURI.setPath(newPath + "/");
  }
});

tinymce.baseURL = "node_modules/tinymce";

tinymce.init({ 
  selector:'div.tinymce-full',
  height: "100%",
  indent: true,
  toolbar: true,
  theme: 'silver',
  menu: {
    file: { title: 'File', items: 'newdocument restoredraft menuload menusave menusaveas |  | print | menuquit' },
    edit: { title: 'Edit', items: 'undo redo | cut copy paste | selectall | searchreplace' },
    view: { title: 'View', items: 'code | visualaid visualchars visualblocks | spellchecker | preview fullscreen' },
    insert: { title: 'Insert', items: 'image link media template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor toc | insertdatetime' },
    format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript codeformat | formats blockformats fontformats fontsizes align | forecolor backcolor | removeformat' },
    tools: { title: 'Tools', items: 'spellchecker spellcheckerlanguage | code wordcount' },
    table: { title: 'Table', items: 'inserttable tableprops deletetable row column cell' },
    help: { title: 'Help', items: 'help' }
  },
  extended_valid_elements : 'link[rel|href],' +
  'a[class|name|href|target|title|onclick|rel],'+
  'script[type|src],'+
  'iframe[src|style|width|height|scrolling|marginwidth|marginheight|frameborder],'+
  'img[class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name]',
  menubar: 'file edit view insert format tools table tc help',
  toolbar: 'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist checklist | forecolor backcolor casechange permanentpen formatpainter removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media pageembed template link anchor codesample | a11ycheck ltr rtl | showcomments addcomment',
  plugins: 'print preview fullpage powerpaste casechange importcss tinydrive searchreplace autolink save directionality advcode visualblocks visualchars fullscreen image link media mediaembed template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists checklist wordcount tinymcespellchecker a11ychecker imagetools textpattern noneditable help formatpainter permanentpen pageembed charmap tinycomments mentions quickbars linkchecker emoticons menusave', 
  /* autosave */
});
