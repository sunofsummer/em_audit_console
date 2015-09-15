/**
 * Created by Administrator on 2015/9/9.
 */
Ext.ns("AppointmentView");
AppointmentView = Ext.extend(Ext.Panel, {
    constructor: function(a) {
        Ext.applyIf(this, a);
        this.initUIComponents();
        AppointmentView.superclass.constructor.call(this, {
            id: "AppointmentView",
            title: "约会列表",
            region: "center",
            iconCls: "menu-appointment",
            layout: "border",
            items: [this.searchPanel, this.gridPanel]
        });
    },
    initUIComponents: function() {
        this.searchPanel = new HT.SearchPanel({
            colNums: 3,
            layout: "form",
            region: "north",
            keys: [{
                key: Ext.EventObject.ENTER,
                fn: this.search,
                scope: this
            },
            {
                key: Ext.EventObject.ESC,
                fn: this.reset,
                scope: this
            }],
            labelWidth: 60,
            items: [{
                xtype: "datetimefield",
                fieldLabel: "开始时间",
                name: "Q_startTime_D_GT",
                format: "Y-m-d H:i:s",
                width: 220
            },
            {
                xtype: "textfield",
                name: "Q_subject_S_LK",
                fieldLabel: "标题",
                width: 220,
                labelWidth: 40
            },
            {
                xtype: "button",
                text: "查询",
                iconCls: "search",
                scope: this,
                handler: this.search,
                style: "padding-left:10px"
            },
            {
                xtype: "datetimefield",
                fieldLabel: "结束时间",
                name: "Q_endTime_D_LT",
                format: "Y-m-d H:i:s",
                width: 220
            },
            {
                xtype: "textfield",
                name: "Q_location_S_LK",
                fieldLabel: "地点",
                width: 220,
                labelWidth: 40
            },
            {
                xtype: "button",
                text: "清空",
                iconCls: "btn-reset",
                scope: this,
                handler: this.reset,
                style: "padding-left:10px"
            }]
        });
        this.topbar = new Ext.Toolbar({
            items: [{
                iconCls: "btn-add",
                text: "添加约会",
                xtype: "button",
                scope: this,
                handler: this.createRs
            },
            "-", {
                iconCls: "btn-del",
                text: "删除约会",
                xtype: "button",
                scope: this,
                handler: this.removeSelRs
            }]
        });
        this.gridPanel = new HT.GridPanel({
            region: "center",
            tbar: this.topbar,
            rowActions: true,
            sort: [{
                field: "appointId",
                direction: "DESC"
            }],
            url: __ctxPath + "/task/listAppointment.do",
            fields: [{
                name: "appointId",
                type: "int"
            },
            "userId", "subject", "startTime", "endTime", "content", "notes", "location", "inviteEmails"],
            columns: [{
                header: "appointId",
                dataIndex: "appointId",
                hidden: true
            },
            {
                header: "主题",
                dataIndex: "subject"
            },
            {
                header: "开始时间",
                dataIndex: "startTime"
            },
            {
                header: "结束时间",
                dataIndex: "endTime"
            },
            {
                header: "地点",
                dataIndex: "location"
            },
            new Ext.ux.grid.RowActions({
                header: "管理",
                width: 100,
                actions: [{
                    iconCls: "btn-del",
                    qtip: "删除",
                    style: "margin:0 3px 0 3px"
                },
                {
                    iconCls: "btn-edit",
                    qtip: "编辑",
                    style: "margin:0 3px 0 3px"
                }],
                listeners: {
                    scope: this,
                    "action": this.onRowAction
                }
            })]
        });
        this.gridPanel.addListener({
            scope: this,
            "rowdblclick": this.rowClick
        });
    },
    reset: function() {
        this.searchPanel.getForm().reset();
    },
    search: function() {
        $search({
            searchPanel: this.searchPanel,
            gridPanel: this.gridPanel
        });
    },
    rowClick: function(b, a, c) {
        var d = b.getStore().getAt(a);
        this.editRs.call(this, d);
    },
    createRs: function() {
        new AppointmentForm({
            scope: this,
            callback: this.reloadType
        }).show();
    },
    reloadType: function() {
        this.gridPanel.getStore().reload();
    },
    removeRs: function(a) {
        $postDel({
            url: __ctxPath + "/task/multiDelAppointment.do",
            ids: a,
            grid: this.gridPanel
        });
    },
    removeSelRs: function() {
        $delGridRs({
            url: __ctxPath + "/task/multiDelAppointment.do",
            grid: this.gridPanel,
            idName: "appointId"
        });
    },
    editRs: function(a) {
        new AppointmentForm({
            appointId: a.data.appointId,
            scope: this,
            callback: this.reloadType
        }).show();
    },
    onRowAction: function(c, a, d, e, b) {
        switch (d) {
        case "btn-del":
            this.removeRs.call(this, a.data.appointId);
            break;
        case "btn-edit":
            this.editRs.call(this, a);
            break;
        default:
            break;
        }
    }
});