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
        url: '/decrypt/get_list_data/',
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
            xtype: "datefield",
            fieldLabel: "开始时间",
            name: "Q_startTime_D_GT",
            format: "Y-m-d H:i:s",
            labelWidth: 80,
            labelStyle: 'padding-left:10px',
            width: 220
        },
        {
            xtype: "textfield",
            name: "Q_subject_S_LK",
            fieldLabel: "标题",
            labelWidth: 60,
            labelStyle: 'padding-left:20px',
            width: 220
        },
        {
            xtype: "datefield",
            fieldLabel: "结束时间",
            name: "Q_endTime_D_LT",
            format: "Y-m-d H:i:s",
            labelWidth: 80,
            labelStyle: 'padding-left:10px',
            width: 220
        },
        {
            xtype: "textfield",
            name: "Q_location_S_LK",
            fieldLabel: "地点",
            labelWidth: 60,
            labelStyle: 'padding-left:20px',
            width: 220
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
    var fields = this.searchPanel.getForm().getFields();
    var fieldsValue = this.searchPanel.getForm().getFieldValues();
    //var el = Ext.Ajax.serializeForm(this.searchPanel.getForm());
};

var resetSearchForm = function () {

};

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