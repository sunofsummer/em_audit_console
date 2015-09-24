/**
 * Created by yang.xia on 2015/9/2.
 */

Ext.require(['*']);

var cw;
var tabs;

Ext.onReady(function () {
    Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));
    //初始化工具提示
    Ext.tip.QuickTipManager.init();

    /*
     * 配合django crsf验证.
     */
    Ext.Ajax.on('beforerequest', function (conn, options) {
        if (!(/^http:.*/.test(options.url) || /^https:.*/.test(options.url))) {

            if (Ext.util.Cookies.get('csrftoken') == null) {
                Ext.util.Cookies.set('csrftoken', 'csrftoken')
            }
            if (typeof(options.headers) == "undefined") {
                options.headers = {'X-CSRFToken': Ext.util.Cookies.get('csrftoken')};
            } else {
                options.headers['X-CSRFToken'] = Ext.util.Cookies.get('csrftoken');
            }
        }
    }, this);

    var store = Ext.create('Ext.data.TreeStore', {
        root: {
            expanded: true,
            children: [
                { text: "加解密", expanded: true, children: [
                    { id: "AuditLog", text: "解密日志审计", leaf: true, url: '/decrypt/forward_audit_log_list_view/' },
                    { id: "AuditPriv", text: "白名单", leaf: true, url: '/decrypt/white_list_view/'}
                ] }
            ]
        }
    });

    var navigation = Ext.create('Ext.tree.Panel', {
        collapsible: true,
        animate: true,
        title: '加解密相关',
        autoScroll: true,
        border: false,
        rootVisible: false,
        useArrows: true,
        split: true,
        containerScroll: true,
        store: store
    });

    navigation.on('itemclick', function (record, item, index, e, eOpts) {
        if (item.isLeaf()) {
            //setCurrentLocation(node);
            addTab(item);
        } else {
            if (!item.isExpanded())
                item.expand();
            else
                item.collapse();
        }
    });

    var wr = Ext.create('Ext.panel.Panel', {
        region: 'west',
        rootVisible: false,
        collapsible: true,
        layout: 'accordion',
        title: '导航菜单',
        split: true,
        width: '15%',
        minWidth: 70,
        minHeight: 140,
        layoutConfig: {
            animate: true,
            activeOnTop: 1
        }, items: [navigation]
    });

    tabs = Ext.create('Ext.tab.Panel', {
        id: 'tp',
        region: 'center',
        split: false,
        border: false,
        enableTabScroll: true,
        resizeTabs: false,
        frame: false,
        tabTip: '主页',
        layoutOnTabChange: true, // important!
        activeTab: 0,
        items: [
            {
                id: 'ft',
                layout: 'fit',
                title: '我的工作台',
                html: "<iframe id='portal' scrolling='no' width='100%' height='100%'  frameborder='0' src=''></iframe>"
            }
        ]
    });

    /**
     * 添加Tab(单击左侧菜单时)
     *
     * @param node
     */
    var addTab = function (node) {
        Ext.getCmp('mainPanel').getEl().mask('<span style=font-size:12>正在飞速呈现页面,稍等片刻...</span>', 'x-mask-loading');

        setTimeout(function () {
            Ext.getCmp('mainPanel').getEl().unmask();
        }, 400);

        var tab = tabs.queryById(node.raw.id);
        if (!tab) {
            var target = node.raw.url; // may be an Object config later.
            tab = tabs.add({
                id: node.raw.id,
                title: node.raw.text,
                layout: 'fit',
                autoLoad: {
                    url: target,
                    method: 'post',
                    callback: function () {
                        Ext.getCmp('mainPanel').getEl().unmask();
                    },
                    scope: this, // optional scope for the callback
                    discardUrl: true,
                    nocache: true,
                    maskDisabled: true,
                    timeout: 9000,
                    scripts: true
                },
                tabTip: '',
                iconCls: node.raw.iconCls,
                border: false,
                split: false,
                closable: true
            });
        }
        tabs.setActiveTab(tab);
    };

    tabs.on('tabchange', function () {
        if (Ext.isEmpty(this.getActiveTab().tabTip)) {
            Ext.getCmp('mainPanel').setTitle('当前位置:&nbsp;&nbsp;主页');
        } else {
            Ext.getCmp('mainPanel').setTitle(this.getActiveTab().tabTip);
        }
    });

    var viewPort = Ext.create('Ext.Viewport', {
        layout: {
            type: 'border',
            padding: 1
        },
        defaults: {
            split: true
        },
        items: [
            {
                region: 'north',
                frame: false,
                border: false,
                split: true,
                minHeight: 60,
                itemCls : 'app-header',
                html: '<img src="/static/images/logo.png"/>'
            },
            wr,
            {
                region: 'center',
                id: 'mainPanel',
                title: '当前位置:&nbsp;&nbsp;主页',
                iconCls: '',
                autoScroll: false,
                layout: 'fit',
                items: [ tabs ]
            }
        ]
    });
});