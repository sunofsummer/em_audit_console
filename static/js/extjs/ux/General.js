/**
 * Created by yang.xia on 2015/9/9.
 */
Ext.ns("General");
Ext.ns("General.ux.plugins");
General.failureMessage = function (a) {
    if (Ext.isEmpty(a)) {
        a = {
            title: "操作信息",
            msg: "出错了，请联系管理员!"
        };
    }
    Ext.MessageBox.show({
        title: a.title ? a.title : "操作信息",
        msg: a.msg ? a.msg : "出错了，请联系管理员!",
        buttons: Ext.MessageBox.OK,
        icon: "ext-mb-error"
    });
};
var $getGdSelectedIds = function (grid, idName) {
    var selRs = grid.getSelectionModel().getSelections();
    var ids = Array();
    for (var i = 0; i < selRs.length; i++) {
        ids.push(eval("selRs[i].data." + idName));
    }
    return ids;
};
var $postDel = function (a) {
    var b = a.msg == null ? "您确认要删除所选记录吗？" : a.msg;
    Ext.Msg.confirm("信息确认", b,
        function (c) {
            if (c == "yes") {
                Ext.Ajax.request({
                    url: a.url,
                    params: {
                        ids: a.ids
                    },
                    method: "POST",
                    success: function (e, f) {
                        var d = Ext.util.JSON.decode(e.responseText);
                        if (d.success) {
                            Ext.ux.Toast.msg("操作信息", "成功删除该记录！");
                            if (a.callback) {
                                a.callback.call(a.scope);
                                return;
                            }
                            if (a.grid) {
                                a.grid.getStore().reload();
                            }
                        } else {
                            Ext.ux.Toast.msg("操作信息", d.message);
                        }
                    },
                    failure: function (d, e) {
                        Ext.ux.Toast.msg("操作信息", "操作出错，请联系管理员！");
                    }
                });
            }
        });
};
var $delGridRs = function (a) {
    var b = $getGdSelectedIds(a.grid, a.idName);
    if (b.length == 0) {
        Ext.ux.Toast.msg("操作信息", "请选择要删除的记录！");
        return;
    }
    var c = {
        msg: a.msg,
        url: a.url,
        ids: b,
        scope: a.scope,
        grid: a.grid,
        callback: a.callback
    };
    $postDel(c);
};
var $postForm = function (d) {
    var g = d.formPanel.getForm();
    if (!g.isValid()) {
        Ext.ux.Toast.msg("操作信息", "请正确填写表单数据！");
        return;
    }
    var f = d.scope ? d.scope : this,
        b = Ext.isEmpty(d.waitMsg) ? "正在提交数据..." : d.waitMsg,
        c = Ext.isEmpty(d.successMsg) ? "信息成功保存！" : d.successMsg,
        e = Ext.isEmpty(d.failureMsg) ? "信息保存出错，请联系管理员！" : d.failureMsg,
        a;
    g.submit({
        scope: f,
        url: d.url,
        method: "post",
        params: d.params,
        waitMsg: b,
        success: function (h, i) {
            Ext.ux.Toast.msg("操作信息", c);
            if (d.callback) {
                d.callback.call(f, h, i);
            }
            if (d.success) {
                d.success.call(f, h, i);
            }
        },
        failure: function (h, i) {
            a = i.result;
            if (!Ext.isEmpty(a) && !Ext.isEmpty(a.msg)) {
                e = a.msg;
            }
            General.failureMessage({
                msg: e
            });
            if (d.callback) {
                d.callback.call(f, h, i);
            }
        }
    });
};
var $search = function (d) {
    var a = d.searchPanel;
    var e = d.gridPanel;
    if (a.getForm().isValid()) {
        var b = e.getStore();
        var f = Ext.Ajax.serializeForm(a.getForm().getEl());
        var c = Ext.urlDecode(f);
        Ext.apply(c, {
            searchAll: e.showPaging || e.showPaging === undefined ? false : true
        });
        c.start = 0;
        c.limit = b.baseParams.limit;
        var g = b.baseParams ? b.baseParams : {};
        Ext.apply(g, c);
        b.baseParams = g;
        e.getBottomToolbar().moveFirst();
    }
};
General.SearchPanel = Ext.extend(Ext.form.FormPanel, {
    constructor: function (f) {
        var e = f.colNums ? f.colNums : 1;
        Ext.apply(this, f);
        if (e > 1 && f.items) {
            this.items = [];
            var j = null;
            var g = 0;
            for (var d = 0; d < f.items.length; d++) {
                var h = f.items[d];
                if (h.xtype != "hidden") {
                    if (g % e == 0) {
                        j = {
                            xtype: "compositefield",
                            fieldLabel: h.fieldLabel,
                            items: [],
                            defaults: {
                                style: "margin:0 0 0 0"
                            }
                        };
                        this.items.push(j);
                    } else {
                        var a = ":";
                        if (this.superclass.labelSeparator) {
                            a = this.superclass.labelSeparator;
                        }
                        var c = 100;
                        if (this.labelWidth) {
                            c = this.labelWidth;
                        }
                        if (h.labelWidth) {
                            c = h.labelWidth;
                        }
                        var b = "text-align:left;padding: 3px 3px 3px 0;";
                        if ("right" == this.labelAlign) {
                            b = "text-align:right;padding: 3px 3px 3px 0;";
                        }
                        if (h.fieldLabel) {
                            j.items.push({
                                xtype: "label",
                                width: c,
                                style: b,
                                text: h.fieldLabel + a
                            });
                        }
                    }
                    j.items.push(h);
                    g++;
                } else {
                    this.items.push(h);
                }
            }
        }
        General.SearchPanel.superclass.constructor.call(this, {
            autoHeight: true,
            border: false,
            style: "padding:6px;background-color: white",
            buttonAlign: "center"
        });
    }
});
General.ux.plugins.Export = Ext.extend(Object, {
    constructor: function (a) {
        Ext.apply(this, a);
        General.ux.plugins.Export.superclass.constructor.call(this, a);
    },
    init: function (b) {
        var a = new Ext.SplitButton({
            text: "导出",
            iconCls: "btn-export",
            menu: new Ext.menu.Menu({
                items: [
                    {
                        text: "导出当前页EXCEL",
                        iconCls: "btn-export-excel",
                        listeners: {
                            click: function () {
                                var c;
                                if (b.getXType() != "htgrid") {
                                    c = b.findParentBy(function (d, e) {
                                        return (d instanceof Ext.grid.GridPanel) ? true : false;
                                    });
                                } else {
                                    c = b;
                                }
                                CommonExport(c, false, "xls", b.searchPanel);
                            }
                        }
                    },
                    {
                        text: "导出全部记录EXCEL",
                        iconCls: "btn-export-excel",
                        listeners: {
                            click: function () {
                                var c;
                                if (b.getXType() != "htgrid") {
                                    c = b.findParentBy(function (d, e) {
                                        return (d instanceof Ext.grid.GridPanel) ? true : false;
                                    });
                                } else {
                                    c = b;
                                }
                                CommonExport(c, true, "xls", b.searchPanel);
                            }
                        }
                    },
                    "-",
                    {
                        text: "导出当前页PDF",
                        iconCls: "btn-export-pdf",
                        listeners: {
                            click: function () {
                                var c;
                                if (b.getXType() != "htgrid") {
                                    c = b.findParentBy(function (d, e) {
                                        return (d instanceof Ext.grid.GridPanel) ? true : false;
                                    });
                                } else {
                                    c = b;
                                }
                                CommonExport(c, false, "pdf", b.searchPanel);
                            }
                        }
                    },
                    {
                        text: "导出全部记录PDF",
                        iconCls: "btn-export-pdf",
                        listeners: {
                            click: function () {
                                var c;
                                if (b.getXType() != "htgrid") {
                                    c = b.findParentBy(function (d, e) {
                                        return (d instanceof Ext.grid.GridPanel) ? true : false;
                                    });
                                } else {
                                    c = b;
                                }
                                CommonExport(c, true, "pdf", b.searchPanel);
                            }
                        }
                    }
                ]
            })
        });
        if (b.getXType() != "htgrid") {
            b.add("->");
            b.add("-");
            b.add(a);
            b.add("-");
            b.on({
                beforedestroy: function () {
                    a.destroy();
                }
            });
        } else {
            b.getTopToolbar().add(a);
        }
    }
});
function CommonExport(j, g, f, b) {
    var l;
    if (j.getXType() != "htgrid") {
        l = j.getColumnModel().columns;
    } else {
        l = j.getColumnModel().config;
    }
    var p = "";
    var c = "";
    for (var i = 0; i < l.length; i++) {
        if (!l[i].isExp) {
            if (l[i].dataIndex != null && l[i].dataIndex != "" && l[i].dataIndex != "undefined") {
                p += l[i].header + ",";
                if (l[i].javaRenderer != null) {
                    c += "javaRenderer" + l[i].javaRenderer + ",";
                } else {
                    c += l[i].dataIndex + ",";
                }
            }
        }
    }
    if (p.length > 0) {
        p = p.substring(0, p.length - 1);
        c = c.substring(0, c.length - 1);
    }
    var x = j.store.sortInfo;
    var n = {
        isExport: true,
        isExportAll: g,
        exportType: f,
        colId: c,
        colName: p,
        sort: x + "" != "undefined" ? x.field : "",
        dir: x + "" != "undefined" ? x.direction : ""
    };
    Ext.apply(n, j.store.baseParams);
    var h = j.getBottomToolbar().getPageData().activePage;
    var u = j.getBottomToolbar().items.items[13].getValue();
    var e = (h - 1) * u;
    var t = {
        start: e,
        limit: u
    };
    Ext.apply(n, t);
    if (b && b.getForm().isValid()) {
        var o = Ext.Ajax.serializeForm(b.getForm().getEl());
        var r = Ext.urlDecode(o);
        Ext.apply(n, r);
    }
    var q = document.getElementById("downloadFrame");
    if (!q) {
        q = document.createElement("iframe");
        q.setAttribute("id", "downloadFrame");
        q.hidden = true;
        document.body.appendChild(q);
    }
    var s;
    if (q.contentDocument) {
        s = q.contentDocument;
    } else {
        if (q.contentWindow) {
            s = q.contentWindow.document;
        } else {
            s = q.document;
        }
    }
    if (s.document) {
        s = s.document;
    }
    var k = s.body;
    if (!k) {
        s.write("<head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'></head>");
        k = s.createElement("body");
        s.appendChild(k);
    }
    var w = s.getElementById("downloadForm");
    if (w) {
        s.body.removeChild(w);
    }
    w = s.createElement("form");
    w.id = "downloadForm";
    s.body.appendChild(w);
    var d = j.store.proxy.url;
    for (var m in n) {
        var a = s.createElement("input");
        a.type = "hidden";
        a.name = m;
        a.value = n[m];
        if (n[m] != "") {
            w.appendChild(a);
        }
    }
    w.method = "post";
    w.action = d;
    w.submit();
}
General.ux.plugins.Print = Ext.extend(Object, {
    constructor: function (a) {
        Ext.apply(this, a);
        General.ux.plugins.Print.superclass.constructor.call(this, a);
    },
    init: function (b) {
        var a = new Ext.Button({
            text: "打印",
            iconCls: "btn-print",
            listeners: {
                click: function () {
                    if (b.getXType() != "htgrid") {
                        var c = b.findParentBy(function (d, e) {
                            return (d instanceof Ext.grid.GridPanel) ? true : false;
                        });
                        gpObj = document.getElementById(c.id);
                    } else {
                        gpObj = document.getElementById(b.id);
                    }
                    window.open("/js/printer/Print.jsp");
                }
            }
        });
        if (b.getXType() != "htgrid") {
            b.add("->");
            b.add("-");
            b.add(a);
            b.on({
                beforedestroy: function () {
                    a.destroy();
                }
            });
        } else {
            b.getTopToolbar().add(a);
        }
    }
});
General.PagingBar = Ext.extend(Ext.toolbar.Paging, {
    constructor: function (b) {
        var a = {
            pageSize: b.store.baseParams.limit ? b.store.baseParams.limit : 25,
            displayInfo: true,
            displayMsg: "当前显示从{0}至{1}， 共{2}条记录",
            emptyMsg: "当前没有记录",
            plugins: [new Ext.ux.plugins.PageComboResizer()]
        };
        if (b.exportable) {
            var c = {
                store: b.store
            };
            if (b.searchForm) {
                Ext.apply(c, {
                    searchForm: b.searchForm
                });
            }
            a.plugins.push(new General.ux.plugins.Export(c));
        }
        if (b.printable) {
            a.plugins.push(new General.ux.plugins.Print());
        }
        Ext.apply(a, b);
        General.PagingBar.superclass.constructor.call(this, a);
    }
});
General.JsonStore = Ext.extend(Ext.data.JsonStore, {
    constructor: function (a) {
        var c = a.baseParams ? a.baseParams : {
            start: 0,
            limit: 25
        };
        var b = {
            baseParams: c,
            root: a.root ? a.root : "result",
            totalProperty: "totalCounts",
            remoteSort: true
        };
        Ext.applyIf(b, a);
        General.JsonStore.superclass.constructor.call(this, b);
    }
});
General.initGridConfig = function (b) {
    if (!b.store) {
        b.store = new General.JsonStore({
            url: b.url,
            fields: b.fields,
            baseParams: b.baseParams,
            root: b.root
        });
        Ext.apply(b.store.baseParams, {
            searchAll: b.showPaging || b.showPaging === undefined ? false : true
        });
        if (b.sort) {
            b.store.sort(b.sort);
        } else {
            if (b.url) {
                b.store.load();
            }
        }
    } else {
        Ext.apply(b.store.baseParams, {
            searchAll: b.showPaging || b.showPaging === undefined ? false : true
        });
    }
    for (var c = 0; c < b.columns.length; c++) {
        if (!b.columns[c].renderer) {
            b.columns[c].renderer = function (m, k, i, n, l, j) {
                if (!Ext.isEmpty(m)) {
                    k.attr = ' ext:qtip="' + m + '"';
                }
                return m;
            };
        }
        if (b.headers) {
            b.columns[c].header = b.headers[c];
        }
    }
    b.sm = new Ext.grid.CheckboxModel({
        singleSelect: b.singleSelect ? b.singleSelect : false
    });
    var h = true;
    if (b.showChbCol == false) {
        h = false;
    }
    if (h) {
        if (b.columns) {
            b.columns.unshift(b.sm);
            b.columns.unshift(new Ext.grid.RowNumberer());
        } else {
            b.columns = [b.sm, new Ext.grid.RowNumberer()];
        }
    }
    if (!b.tbar && b.isShowTbar != false) {
        b.tbar = new Ext.Toolbar();
    }
    if (b.addTool) {
        b.tbar.add(new Ext.Button({
            text: "添加记录",
            iconCls: "btn-add",
            scope: this,
            handler: function () {
                var i = b.store.recordType;
                b.store.add(new i());
            }
        }));
    }
    b.cm = new Ext.grid.ColumnModel({
        columns: b.columns,
        defaults: {
            sortable: b.sortable ? b.sortable : true,
            menuDisabled: false,
            width: 100
        }
    });
    b.plugins = [];
    if (b.rowActions) {
        var f = b.columns[b.columns.length - 1];
        b.plugins.push(f);
    }
    if (b.expander) {
        b.plugins.push(b.expander);
    }
    if (b.checkColumn) {
        if (Ext.isArray(b.checkColumn)) {
            for (var c = 0; c < b.checkColumn.length; c++) {
                b.plugins.push(b.checkColumn[c]);
            }
        } else {
            b.plugins.push(b.checkColumn);
        }
    }
    if (b.exportable && !b.setPagingBar) {
        var d = {
            store: b.store
        };
        if (b.searchPanel) {
            Ext.apply(d, {
                searchPanel: b.searchPanel
            });
        }
        b.plugins.push(new General.ux.plugins.Export(d));
    }
    var a = {
        store: b.store
    };
    if (b.showPaging != false) {
        if (b.exportable && b.setPagingBar) {
            if (b.setPagingBar) {
                Ext.apply(a, {
                    exportable: true
                });
            }
            if (b.searchPanel) {
                Ext.apply(a, {
                    searchPanel: b.searchPanel
                });
            }
        }
    } else {
        Ext.apply(a, {
            hidden: true
        });
    }
    var g = new General.PagingBar(a);
    if (b.printable) {
        b.plugins.push(new General.ux.plugins.Print());
    }
    var e = {
        shim: true,
        trackMouseOver: true,
        disableSelection: false,
        loadMask: true,
        stripeRows: true,
        viewConfig: {
            forceFit: true,
            enableRowBody: false,
            showPreview: false
        },
        bbar: g
    };
    Ext.apply(e, b);
    return e;
};
General.GridPanel = Ext.extend(Ext.grid.GridPanel, {
    constructor: function (a) {
        var b = General.initGridConfig(a);
        General.GridPanel.superclass.constructor.call(this, b);
    }
});
General.initDataViewConfig = function (a) {
    if (!a.store) {
        a.store = new General.JsonStore({
            url: a.url,
            fields: a.fields,
            baseParams: a.baseParams,
            root: a.root
        });
        Ext.apply(a.store.baseParams, {
            searchAll: a.showPaging || a.showPaging === undefined ? false : true
        });
        if (a.sort) {
            a.store.sort(a.sort);
        }
        if (a.url) {
            a.store.load();
        }
    } else {
        Ext.apply(a.store.baseParams, {
            searchAll: a.showPaging || a.showPaging === undefined ? false : true
        });
    }
    var b = {
        multiSelect: true,
        autoScroll: true
    };
    Ext.apply(b, a);
    return b;
};
General.DataView = Ext.extend(Ext.DataView, {
    constructor: function (a) {
        var b = General.initDataViewConfig(a);
        General.DataView.superclass.constructor.call(this, b);
    }
});
General.FormPanel = Ext.extend(Ext.form.FormPanel, {
    constructor: function (a) {
        var b = {
            layout: "form",
            bodyStyle: "padding:5px",
            defaults: {
                anchor: "96%,96%"
            },
            defaultType: "textfield",
            border: false
        };
        Ext.apply(b, a);
        General.FormPanel.superclass.constructor.call(this, b);
    }
});
var getValueByName = function (name, data, conf) {
    if (name) {
        if (conf.preName) {
            if (name.indexOf(conf.preName) != -1) {
                name = name.substring(conf.preName.length + 1);
            }
        }
        var val = eval(conf.root + "." + name);
        if (!Ext.isEmpty(val)) {
            return val;
        }
    }
    return "";
};
var setByName = function (a, d, j) {
    var k = a.items;
    if (k != null && k != undefined && k.getCount) {
        for (var f = 0; f < k.getCount(); f++) {
            var g = k.get(f);
            if (g.items) {
                setByName(g, d, j);
                continue;
            }
            var c = g.getXType();
            try {
                if (c == "textfield" || c == "textarea" || c == "radio" || c == "checkbox" || c == "datefield" || c == "hidden" || c == "numberfield" || c == "datetimefield" || c == "timefield" || c == "htmleditor" || c == "ckeditor" || c == "displayfield" || c == "diccombo") {
                    var b = getValueByName(g.getName(), d, j);
                    if (b == "") {
                        b = g.getValue();
                    }
                    g.setValue(b);
                } else {
                    if (c == "combo" || c == "iconcomb") {
                        g.valueNotFoundText = getValueByName(g.name, d, j);
                        g.setValue(getValueByName(g.getName(), d, j));
                    } else {
                        if (c == "combotree") {
                            g.setValue(getValueByName(g.name, d, j));
                            g.hiddenField.value = getValueByName(g.hiddenName, d, j);
                        }
                    }
                }
            } catch (h) {
            }
        }
    }
};
Ext.form.TextField.prototype.size = 20;
Ext.form.TextField.prototype.initValue = function () {
    if (this.value !== undefined) {
        this.setValue(this.value);
    } else {
        if (this.el.dom.value.length > 0) {
            this.setValue(this.el.dom.value);
        }
    }
    this.el.dom.size = this.size;
    if (!isNaN(this.maxLength) && (this.maxLength * 1) > 0 && (this.maxLength != Number.MAX_VALUE)) {
        this.el.dom.maxLength = this.maxLength * 1;
    }
};
General.ComboBox = Ext.extend(Ext.form.ComboBox, {
    constructor: function (a) {
        Ext.apply(this, a);
        General.ComboBox.superclass.constructor.call(this);
    }
});
setFormValues = function (b, i) {
    var c = b.elements || (document.forms[b] || Ext.getDom(b)).elements,
        h = encodeURIComponent,
        f,
        j,
        a,
        d,
        e = "",
        g;
    Ext.each(c,
        function (k) {
            a = k.name;
            g = k.type;
            if (!k.disabled && a) {
                if (/select-(one|multiple)/i.test(g)) {
                    Ext.each(k.options,
                        function (l) {
                            if (l.value == i[a]) {
                                l.selected = true;
                            }
                        });
                } else {
                    if (!/file|undefined|reset|button/i.test(g)) {
                        if (!(/radio|checkbox/i.test(g) && !k.checked) && !(g == "submit")) {
                            k.value = i[a];
                        }
                    }
                }
            }
        });
};
General.JSON = new (function () {
    var e = !!{}.hasOwnProperty,
        c = function () {
            var h = null;
            return function () {
                if (h === null) {
                    h = Ext.USE_NATIVE_JSON && window.JSON && JSON.toString() == "[object JSON]";
                }
                return h;
            };
        }(),
        f = function (h) {
            return h < 10 ? "0" + h : h;
        },
        d = function (m) {
            if (!Ext.isDefined(m) || m === null) {
                return "null";
            } else {
                if (Ext.isArray(m)) {
                    return g(m);
                } else {
                    if (Ext.isDate(m)) {
                        return General.JSON.encodeDate(m);
                    } else {
                        if (Ext.isString(m)) {
                            return b(m);
                        } else {
                            if (typeof m == "number") {
                                return isFinite(m) ? String(m) : "null";
                            } else {
                                if (Ext.isBoolean(m)) {
                                    return String(m);
                                } else {
                                    var j = ["{"],
                                        h,
                                        l,
                                        k;
                                    for (var l in m) {
                                        if (!m.getElementsByTagName) {
                                            if (!e || m.hasOwnProperty(l)) {
                                                k = m[l];
                                                switch (typeof k) {
                                                    case "undefined":
                                                    case "function":
                                                    case "unknown":
                                                        break;
                                                    default:
                                                        if (h) {
                                                            j.push(",");
                                                        }
                                                        j.push(d(l), ":", k === null ? "null" : d(k));
                                                        h = true;
                                                }
                                            }
                                        }
                                    }
                                    j.push("}");
                                    return j.join("");
                                }
                            }
                        }
                    }
                }
            }
        },
        a = {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            '"': '\\"',
            "\\": "\\\\"
        },
        b = function (h) {
            if (/["\\\x00-\x1f]/.test(h)) {
                return '"' + h.replace(/([\x00-\x1f\\"])/g,
                    function (j, i) {
                        var k = a[i];
                        if (k) {
                            return k;
                        }
                        k = i.charCodeAt();
                        return "\\u00" + Math.floor(k / 16).toString(16) + (k % 16).toString(16);
                    }) + '"';
            }
            return '"' + h + '"';
        },
        g = function (p) {
            var k = ["["],
                h,
                n,
                j = p.length,
                m;
            for (n = 0; n < j; n += 1) {
                m = p[n];
                switch (typeof m) {
                    case "undefined":
                    case "function":
                    case "unknown":
                        break;
                    default:
                        if (h) {
                            k.push(",");
                        }
                        k.push(m === null ? "null" : General.JSON.encode(m));
                        h = true;
                }
            }
            k.push("]");
            return k.join("");
        };
    this.encodeDate = function (h) {
        return '"' + h.getFullYear() + "-" + f(h.getMonth() + 1) + "-" + f(h.getDate()) + " " + f(h.getHours()) + ":" + f(h.getMinutes()) + ":" + f(h.getSeconds()) + '"';
    };
    this.encode = function () {
        var h;
        return function (i) {
            if (!h) {
                h = c() ? JSON.stringify : d;
            }
            return h(i);
        };
    }();
})();
General.encode = General.JSON.encode;
Ext.useShims = true;
General.HBoxPanel = Ext.extend(Ext.Panel, {
    constructor: function (b) {
        var a = {
            border: false,
            layoutConfig: {
                padding: "5",
                pack: b.pack != null ? b.pack : "center",
                align: b.align != null ? b.align : "middle"
            },
            defaults: {
                margins: "0 5 0 0"
            },
            layout: "hbox"
        };
        Ext.apply(a, b);
        General.HBoxPanel.superclass.constructor.call(this, a);
    }
});
Ext.useShims = true;
Ext.Window.prototype.constrain = true;
Ext.apply(Ext.form.VTypes, {
    daterange: function (d, c) {
        var b = c.parseDate(d);
        if (!b) {
            return false;
        }
        if (c.startDateField) {
            var e = Ext.getCmp(c.startDateField);
            if (!e.maxValue || (b.getTime() != e.maxValue.getTime())) {
                e.setMaxValue(b);
                e.validate();
            }
        } else {
            if (c.endDateField) {
                var a = Ext.getCmp(c.endDateField);
                if (!a.minValue || (b.getTime() != a.minValue.getTime())) {
                    a.setMinValue(b);
                    a.validate();
                }
            }
        }
        return true;
    },
    timerange: function (h, f) {
        var b = f.parseDate(h);
        if (!b) {
            return false;
        }
        if (f.maxDateField) {
            var e = f.maxDateField;
            if (Ext.isArray(e)) {
                for (var c = 0; c < e.length; c++) {
                    var g = Ext.getCmp(e[c]);
                    if (!g.maxValue || (b.getTime() != g.maxValue.getTime())) {
                        g.setMaxValue(b);
                        g.validate();
                    }
                }
            }
        } else {
            if (f.minDateField) {
                var a = f.minDateField;
                if (Ext.isArray(a)) {
                    for (var c = 0; c < a.length; c++) {
                        var d = Ext.getCmp(a[c]);
                        if (!d.minValue || (b.getTime() != d.minValue.getTime())) {
                            d.setMinValue(b);
                            d.validate();
                        }
                    }
                }
            }
        }
        return true;
    },
    password: function (c, b) {
        if (b.initialPassField) {
            var a = Ext.getCmp(b.initialPassField);
            return (c == a.getValue());
        }
        return true;
    },
    passwordText: "密码不匹配，请重新输入！"
});
var $genNumber = function (a) {
    var b = a.scope ? a.scope : this;
    Ext.Ajax.request({
        url: "/system/genNumberSerialNumber.do",
        params: {
            alias: a.alias
        },
        scope: b,
        success: function (d, e) {
            var c = Ext.util.JSON.decode(d.responseText);
            if (Ext.isEmpty(c.number)) {
                Ext.ux.Toast.msg("操作信息", '请到流水号管理设置别名为"' + a.alias + '"的配置');
                return;
            }
            if (a.callback) {
                a.callback.call(b, c.number);
            }
        },
        failure: function (c, d) {
            if (a.callback) {
                a.callback.call(b, "");
            }
        }
    });
};