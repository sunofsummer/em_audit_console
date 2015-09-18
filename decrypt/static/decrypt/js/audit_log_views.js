/**
 * Created by yang.xia on 2015/9/9.
 */

Ext.define('AuditLog', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'module_id', type: 'int'},
        {name: 'request_ip', type: 'string'},
        {name: 'is_success', type: 'string'},
        {name: 'create_date', type: 'string'},
        {name: 'error_msg', type: 'string'}
    ]
});

var store = Ext.create('Ext.data.Store', {
    model: 'AuditLog',
    proxy: {
        type: 'ajax',
        url: '/decrypt/get_audit_log_list_data/',
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
var buttonBar = Ext.create('Ext.toolbar.Toolbar', {
    dock: 'top',
    items: [
        {
            xtype: 'button',
            text: '新建',
            iconCls: 'Add',
            handler: function () {
            }
        },
        '-',
        {
            xtype: 'button',
            text: '删除',
            iconCls: 'Delete',
            handler: function () {
            }
        }
    ]
});

var checkboxModel = Ext.create('Ext.selection.CheckboxModel');

var gridPanel = Ext.create('Ext.grid.Panel', {
    region: 'center',
    store: store,
    columnLines: true,
    selModel: checkboxModel,
    columns: [
        { text: '序号', xtype: 'rownumberer', width: 50, sortable: false},
        { text: '模块ID', dataIndex: 'module_id' },
        { text: '请求IP', dataIndex: 'request_ip' },
        { text: '是否成功', dataIndex: 'is_success', renderer: function (value) {
            if (value == 'true') {
                return "<font style='color:green'>成功</span>";
            }
            if (value == 'false') {
                return "<font style='color:red'>失败</span>";
            }
        }
        },
        { text: '创建时间', dataIndex: 'create_date', width: 180 },
        { text: '错误信息', dataIndex: 'error_msg' }
    ],
    dockedItems: [buttonBar],
    bbar: {
        xtype: 'pagingtoolbar',
        store: store,
        displayInfo: true
    }
});

var combo = Ext.create('Ext.data.Store', {
    fields: ['key', 'value'],
    data: [
        {"key": "是", "value": "1"},
        {"key": "否", "value": "0"}
    ]
});

var searchPanel = Ext.create('Ext.form.FormPanel', {
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
            fieldLabel: "模块ID",
            name: "module_id",
            labelWidth: 80,
            labelStyle: 'padding-left:10px',
            width: 220
        },
        {
            xtype: "textfield",
            name: "request_ip__startswith",
            fieldLabel: "请求IP",
            labelWidth: 60,
            labelStyle: 'padding-left:20px',
            width: 220
        },
        {
            xtype: "datefield",
            fieldLabel: "创建时间",
            name: "create_date",
            format: "Y-m-d H:i:s",
            labelWidth: 80,
            labelStyle: 'padding-left:10px',
            width: 220
        },
        {
            xtype: "combobox",
            name: "is_success",
            store: combo,
            queryMode: 'local',
            displayField: 'key',
            valueField: 'value',
            fieldLabel: "成功否",
            labelWidth: 60,
            labelStyle: 'padding-left:20px',
            width: 150
        },
        {
            xtype: "button",
            text: "查询",
            iconCls: "Zoom",
            scope: this,
            handler: function () {
                submitSearchForm();
            },
            width: 60
        },
        {
            xtype: "button",
            text: "清空",
            iconCls: "Arrowrotateanticlockwise",
            scope: this,
            handler: function () {
                resetSearchForm();
            },
            width: 60
        }
    ]
});

/**
 * 提交查询条件.
 */
var submitSearchForm = function () {
    var values = this.searchPanel.getForm().getValues();
    var baseParams = Ext.encode(values);
    store.load({
        params: {
            baseParams: baseParams,
            start: 0,
            page: 1,
            limit: 25
        }
    });
};

/**
 * 重置查询条件.
 */
var resetSearchForm = function () {
    this.searchPanel.getForm().reset();
};

/**
 * 翻页查询时带上条件.
 */
store.on('beforeload', function () {
    var values = searchPanel.getForm().getValues();
    this.baseParams = Ext.encode(values);
});

var auditLogPanel = Ext.create('Ext.panel.Panel', {
    layout: "border",
    renderTo: 'centerPanelDiv',
    items: [searchPanel, gridPanel]
});

var activeTab = tabs.getActiveTab();
activeTab.add(auditLogPanel);
activeTab.doLayout();

store.load({
    params: {
        start: 0,
        page: 1,
        limit: 25
    }
});