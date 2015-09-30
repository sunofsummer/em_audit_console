/**
 * Created by yang.xia on 2015/9/24.
 */

Ext.define('PrtDict', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'pk', type: 'int'},
        {name: 'product_name', type: 'string'},
        {name: 'module_name', type: 'string'},
        {name: 'create_date', type: 'string'},
        {name: 'modify_date', type: 'string'}
    ]
});

var PrtDictStore = Ext.create('Ext.data.Store', {
    model: 'PrtDict',
    proxy: {
        type: 'ajax',
        url: '/decrypt/get_prt_dict_data/',
        reader: {
            type: 'json',
            root: 'records',
            totalProperty: 'total'
        }
    },
    frame: true,
    stripeRows: true,
    autoLoad: false
});

// 创建按钮bar组件,是上面的几个按钮。
var PrtDictButtonBar = Ext.create('Ext.toolbar.Toolbar', {
    dock: 'top',
    items: [
        {
            xtype: 'button',
            text: '新增',
            iconCls: 'Add',
            handler: function () {
                pdFormPanelWindowBuild();
            }
        },
        '-',
        {
            xtype: 'button',
            text: '更新',
            iconCls: 'Edit',
            handler: function () {
                var selected = PrtDictGridPanel.getSelectionModel().getSelection();
                if (selected.length == 0) return;
                if (selected.length > 1) {
                    Ext.MessageBox.show({
                        title: '提示信息',
                        msg: '只能同时编辑一条数据',
                        buttons: Ext.MessageBox.YES,
                        icon: Ext.MessageBox.WARNING
                    });
                    return;
                }
                pdFormPanelWindowBuild();
                pdFormPanel.getForm().loadRecord(selected[0]);
            }
        },
        '-',
        {
            xtype: 'button',
            text: '删除',
            iconCls: 'Delete',
            handler: function () {
                var selected = PrtDictGridPanel.getSelectionModel().getSelection();
                if (Ext.isEmpty(selected)) {
                    Ext.MessageBox.show({
                        title: '提示信息',
                        msg: '请选择要删除的数据',
                        buttons: Ext.MessageBox.YES,
                        icon: Ext.MessageBox.WARNING
                    });
                    return;
                }

                Ext.MessageBox.confirm('请确认', '确定要删除选中的数据吗?', function (btn, text) {
                    if (btn == 'yes') {
                        var pks = [];
                        Ext.each(selected, function (row, index, array) {
                            Ext.iterate(row.data, function (key, value, myself) {
                                if (key == 'pk')
                                    pks += ',' + value;
                            });
                        });
                        Ext.Ajax.request({
                            url: '/decrypt/del_prt_dict_data/?pks=' + pks.substring(1, pks.length),
                            success: function (response, opts) {
                                refreshPrtDictSearchPanel();
                            },
                            failure: function (response, opts) {
                                Ext.MessageBox.show({
                                    title: '错误信息',
                                    msg: '删除数据失败',
                                    buttons: Ext.MessageBox.YES,
                                    icon: Ext.MessageBox.ERROR
                                });
                            }
                        });
                    }
                });
            }
        }
    ]
});

var PrtDictCheckboxModel = Ext.create('Ext.selection.CheckboxModel');

var PrtDictGridPanel = Ext.create('Ext.grid.Panel', {
    region: 'center',
    store: PrtDictStore,
    columnLines: true,
    selModel: PrtDictCheckboxModel,
    columns: [
        { text: '序号', xtype: 'rownumberer', width: 40, sortable: false},
        { text: '模块ID', dataIndex: 'pk', width: 60 },
        { text: '产品名称', dataIndex: 'product_name', width: 200 },
        { text: '模块名称', dataIndex: 'module_name', width: 200},
        { text: '创建时间', dataIndex: 'create_date', width: 200 },
        { text: '修改时间', dataIndex: 'modify_date', width: 200 }
    ],
    dockedItems: [PrtDictButtonBar],
    bbar: {
        xtype: 'pagingtoolbar',
        store: PrtDictStore,
        displayInfo: true
    }
});

var PrtDictSearchPanel = Ext.create('Ext.form.FormPanel', {
    region: "north",
    layout: {
        type: 'hbox',
        padding: '5',
        pack: 'start',
        align: 'middle'
    },
    defaults: {
        margins: '0 0 0 8'
    },
    height: 40,
    items: [
        {
            xtype: "textfield",
            name: "product_name__startswith",
            fieldLabel: "产品名称",
            labelWidth: 80,
            labelStyle: 'padding-left:10px',
            width: 220
        },
        {
            xtype: "textfield",
            fieldLabel: "模块名称",
            name: "module_name__startswith",
            labelWidth: 80,
            labelStyle: 'padding-left:20px',
            width: 220
        },
        {
            xtype: "button",
            text: "查询",
            iconCls: "Zoom",
            scope: this,
            handler: function () {
                refreshPrtDictSearchPanel();
            },
            width: 60
        },
        {
            xtype: "button",
            text: "清空",
            iconCls: "Arrowrotateanticlockwise",
            scope: this,
            handler: function () {
                PrtDictSearchPanel.getForm().reset();
            },
            width: 60
        }
    ]
});

/**
 * 提交查询条件.
 */
var refreshPrtDictSearchPanel = function () {
    var values = this.PrtDictSearchPanel.getForm().getValues();
    var baseParams = Ext.encode(values);
    PrtDictStore.load({
        params: {
            baseParams: baseParams,
            start: 0,
            page: 1,
            limit: 25
        }
    });

}

/**
 * 翻页查询时带上条件.
 */
PrtDictStore.on('beforeload', function () {
    var values = PrtDictSearchPanel.getForm().getValues();
    this.baseParams = Ext.encode(values);
});

var PrtDictPanel = Ext.create('Ext.panel.Panel', {
    layout: "border",
    renderTo: 'centerPanelDiv',
    items: [PrtDictSearchPanel, PrtDictGridPanel]
});

var activeTab = tabs.getActiveTab();
activeTab.add(PrtDictPanel);
activeTab.doLayout();

PrtDictStore.load({
    params: {
        start: 0,
        page: 1,
        limit: 25
    }
});

var pdFormPanel, pdFormPanelWindow, field = new Ext.form.field.Text({
        renderTo: document.body
    }), fieldHeight = field.getHeight(),
    wlPadding = 5,
    remainingHeight;

field.destroy();

remainingHeight = wlPadding + fieldHeight * 2;
function pdFormPanelWindowBuild() {
    pdFormPanel = new Ext.form.FormPanel({
        id: 'pdForm',
        name: 'pdForm',
        defaultType: 'textfield',
        labelAlign: 'right',
        labelWidth: 100,
        frame: false,
        border: false,
        bodyPadding: wlPadding,
        items: [
            {
                fieldLabel: '模块ID',
                id: 'pk',
                name: 'pk',
                hidden: true,
                anchor: '70%',
                maxLength: 140,
                allowBlank: false
            },
            {
                fieldLabel: '产品名称',
                id: 'product_name',
                name: 'product_name',
                anchor: '70%',
                maxLength: 140,
                allowBlank: false
            },
            {
                fieldLabel: '模块名称',
                id: 'module_name',
                name: 'module_name',
                anchor: '70% -' + remainingHeight,
                maxLength: 140,
                allowBlank: false
            }
        ]
    });
    pdFormPanelWindow = new Ext.Window({
        layout: 'fit',
        width: 400,
        height: 180,
        resizable: false,
        draggable: true,
        closeAction: 'close',
        title: '<span class="commoncss">新增白名单</span>',
        modal: true,
        collapsible: true,
        titleCollapse: true,
        maximizable: false,
        buttonAlign: 'right',
        border: false,
        animate: true,
        animCollapse: true,
        animateTarget: Ext.getBody(),
        pageY: document.body.clientHeight / 2 - this.height / 2,
        pageX: document.body.clientWidth / 2 - this.width / 2,
        constrain: true,
        items: [pdFormPanel],
        buttons: [
            {
                text: '保存',
                iconCls: 'Databasesave',
                handler: function () {
                    var params = pdFormPanelWindow.getComponent('pdForm').form.getValues();
                    //if (pdFormPanelWindow.getComponent('pdForm').form.isValid()) {
                    Ext.Ajax.request({
                        url: '/decrypt/save_or_update_prt_dict_data/',
                        success: function (response, opts) {
                            pdFormPanelWindow.getComponent('pdForm').getForm().reset();
                            pdFormPanelWindow.close();
                            refreshPrtDictSearchPanel();
                        },
                        failure: function (response, opts) {
                        },
                        params: Ext.encode(params)
                    });
                    //}
                }
            },
            {
                text: '关闭',
                iconCls: 'Binclosed',
                handler: function () {
                    pdFormPanelWindow.close();
                }
            }
        ]
    });
    pdFormPanelWindow.show();
}