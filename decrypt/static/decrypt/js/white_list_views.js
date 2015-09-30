/**
 * Created by yang.xia on 2015/9/24.
 */

Ext.define('WhiteList', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'pk', type: 'int'},
        {name: 'bind_ip', type: 'string'},
        {name: 'memo', type: 'string'}
    ]
});

var whiteListStore = Ext.create('Ext.data.Store', {
    model: 'WhiteList',
    proxy: {
        type: 'ajax',
        url: '/decrypt/get_white_list_data/',
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
var whiteListButtonBar = Ext.create('Ext.toolbar.Toolbar', {
    dock: 'top',
    items: [
        {
            xtype: 'button',
            text: '新增',
            iconCls: 'Add',
            handler: function () {
                wlFormPanelWindowBuild();
            }
        },
        '-',
        {
            xtype: 'button',
            text: '更新',
            iconCls: 'Edit',
            handler: function () {
                var selected = whiteListGridPanel.getSelectionModel().getSelection();
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
                wlFormPanelWindowBuild();
                wlFormPanel.getForm().loadRecord(selected[0]);
            }
        },
        '-',
        {
            xtype: 'button',
            text: '删除',
            iconCls: 'Delete',
            handler: function () {
                var selected = whiteListGridPanel.getSelectionModel().getSelection();
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
                            url: '/decrypt/del_white_list_data/?pks=' + pks.substring(1, pks.length),
                            success: function (response, opts) {
                                refreshWhiteListSearchPanel();
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

var whiteListCheckboxModel = Ext.create('Ext.selection.CheckboxModel');

var whiteListGridPanel = Ext.create('Ext.grid.Panel', {
    region: 'center',
    store: whiteListStore,
    columnLines: true,
    selModel: whiteListCheckboxModel,
    columns: [
        { text: '序号', xtype: 'rownumberer', width: 40, sortable: false},
        { text: '主键', dataIndex: 'pk', width: 40 },
        { text: '绑定IP', dataIndex: 'bind_ip', width: 150 },
        { text: '备注', dataIndex: 'memo', width: 250}
    ],
    dockedItems: [whiteListButtonBar],
    bbar: {
        xtype: 'pagingtoolbar',
        store: whiteListStore,
        displayInfo: true
    }
});

var whiteListSearchPanel = Ext.create('Ext.form.FormPanel', {
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
            name: "bind_ip__startswith",
            fieldLabel: "绑定IP",
            labelWidth: 60,
            labelStyle: 'padding-left:10px',
            width: 220
        },
        {
            xtype: "textfield",
            fieldLabel: "备注",
            name: "memo",
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
                refreshWhiteListSearchPanel();
            },
            width: 60
        },
        {
            xtype: "button",
            text: "清空",
            iconCls: "Arrowrotateanticlockwise",
            scope: this,
            handler: function () {
                whiteListSearchPanel.getForm().reset();
            },
            width: 60
        }
    ]
});

/**
 * 提交查询条件.
 */
var refreshWhiteListSearchPanel = function () {
    var values = this.whiteListSearchPanel.getForm().getValues();
    var baseParams = Ext.encode(values);
    whiteListStore.load({
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
whiteListStore.on('beforeload', function () {
    var values = whiteListSearchPanel.getForm().getValues();
    this.baseParams = Ext.encode(values);
});

var whiteListPanel = Ext.create('Ext.panel.Panel', {
    layout: "border",
    renderTo: 'centerPanelDiv',
    items: [whiteListSearchPanel, whiteListGridPanel]
});

var activeTab = tabs.getActiveTab();
activeTab.add(whiteListPanel);
activeTab.doLayout();

whiteListStore.load({
    params: {
        start: 0,
        page: 1,
        limit: 25
    }
});

var wlFormPanel, wlFormPanelWindow, field = new Ext.form.field.Text({
        renderTo: document.body
    }), fieldHeight = field.getHeight(),
    wlPadding = 5,
    remainingHeight;

field.destroy();

remainingHeight = wlPadding + fieldHeight * 2;
function wlFormPanelWindowBuild() {
    wlFormPanel = new Ext.form.FormPanel({
        id: 'wlForm',
        name: 'wlForm',
        defaultType: 'textfield',
        labelAlign: 'right',
        labelWidth: 100,
        frame: false,
        border: false,
        bodyPadding: wlPadding,
        items: [
            {
                fieldLabel: '主键',
                id: 'pk',
                name: 'pk',
                hidden: true,
                anchor: '70%',
                maxLength: 140,
                allowBlank: false
            },
            {
                fieldLabel: '绑定IP',
                id: 'bind_ip',
                name: 'bind_ip',
                anchor: '70%',
                maxLength: 140,
                allowBlank: false
            },
            {
                fieldLabel: '备注',
                id: 'memo',
                name: 'memo',
                anchor: '70% -' + remainingHeight,
                maxLength: 140,
                allowBlank: false
            }
        ]
    });
    wlFormPanelWindow = new Ext.Window({
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
        items: [wlFormPanel],
        buttons: [
            {
                text: '保存',
                iconCls: 'Databasesave',
                handler: function () {
                    var params = wlFormPanelWindow.getComponent('wlForm').form.getValues();
                    if (wlFormPanelWindow.getComponent('wlForm').form.isValid()) {
                        Ext.Ajax.request({
                            url: '/decrypt/save_or_update_white_list_data/',
                            success: function (response, opts) {
                                wlFormPanelWindow.getComponent('wlForm').getForm().reset();
                                wlFormPanelWindow.close();
                                refreshWhiteListSearchPanel();
                            },
                            failure: function (response, opts) {
                            },
                            params: Ext.encode(params)
                        });
                    }
                }
            },
            {
                text: '关闭',
                iconCls: 'Binclosed',
                handler: function () {
                    wlFormPanelWindow.close();
                }
            }
        ]
    });
    wlFormPanelWindow.show();
}