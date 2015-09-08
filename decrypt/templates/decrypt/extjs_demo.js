/**
 * 默认页面
 *
 * @author leaves.qq:1330771552
 */

Ext.define('SupplyManagementDesktop.defaultsWindow', {
    extend: 'Ext.ux.desktop.Module',

    requires: ['Ext.data.ArrayStore', 'Ext.util.Format', 'Ext.grid.Panel',
        'Ext.grid.RowNumberer', 'Ext.ux.LiveSearchGridPanel'],

    id: 'defaultsWindow-win',

    /***************************************************************************
     * ExtJS控件使用按照如下规则。 首先，创建控件，调用Ext.create
     * weightName:空间命名空间，args：空间参数，用{}包围，当做对象传入
     *
     * ####################################### 注意JS中有如下语法： var object={
     * paramter1:value1, paramter2:value2, paramter3:value3 }
     * object.paramter1可以直接获得value1 #####################################
     *
     * ExtJS中所有空间创建方法都如上
     *
     * Ext.create(String weightName,Mixed args)
     * 所以此处args相当于一个匿名对象（没有引用），但并非真的匿名对象
     *
     */
    // 初始化窗体的方法
    init: function () {
        this.launcher = {
            text: 'Defaults Window',
            iconCls: 'icon-grid',
            // 调用createWindow方法
            handler: this.createWindow,
            scope: this
            // this指向Ext.define（这个方法用来声明命名空间。）定义的命名空间
        };
    },// 初始化窗体的方法结束

    // 创建窗体的方法
    createWindow: function () {
        // 下面进行预定义。就好像C里面的 先定义后使用。不然后定义的在前面使用会认为未初始化。（猜测：可能不跟JS一样，属于ExtJS的语法）
        var dataPanel;// 预定义一个GridPanel，用来显示数据
        var innerPanel;// 存放Panel的容器
        var workerPanel;
        var westPanel;
        var deptStore;
        var moduleObj = this;// 创建windows窗体的时获取下本身的环境,此处不能确定，这个this是指向Ext.define还是指向创建的这个窗体
        var desktop = this.app.getDesktop();

        // 获取窗体，外部最大窗体，具体方法不清楚。
        var win = desktop.getWindow('defaultsWindow-win');

        // 创建按钮bar组件,是上面的几个按钮。
        var buttonBar = Ext.create('Ext.toolbar.Toolbar', {
            dock: 'top',
            items: [
                {
                    xtype: 'button',
                    text: '新建',
                    iconCls: 'add',
                    handler: function () {
                        // 自行新建操作，传入一个create字符串用来标示是什么按钮事件，传入dataPanel（注意：上面没有var
                        // dataPanel;此处会报错。）因为后面的新建需要用到表格显示的数据（dataPanel.getSelectionModel().getSelection()）
                        moduleObj.proAction("create", dataPanel, workerPanel);
                    }
                },
                {
                    // 分隔符，不解释。
                    xtype: 'tbseparator'
                },
                {
                    xtype: 'button',
                    text: '删除',
                    iconCls: 'remove',
                    handler: function () {
                        moduleObj.proAction("delete", dataPanel);
                    }
                },
                {
                    xtype: 'tbseparator'
                },
                {
                    xtype: 'button',
                    text: '复制',
                    iconCls: 'copy',
                    handler: function () {
                        moduleObj.proAction("copy", dataPanel, workerPanel);
                    }
                },
                {
                    xtype: 'button',
                    text: '重置检索',
                    iconCls: 'reset',
                    handler: function () {
                        dataPanel.resetSearch();
                    }
                }
            ]
        });// 创建按钮bar组件结束

        // 临时创建的一个用来展示的store
        var theStore = Ext.create('Ext.data.Store', {
            fields: [
                {
                    name: 'projectId',
                    type: 'String'
                },
                {
                    name: 'projectCode',
                    type: 'String'
                },
                {
                    name: 'projectName',
                    type: 'String'
                },
                {
                    name: 'startDate',
                    type: 'String'
                },
                {
                    name: 'endDate',
                    type: 'string'
                },
                {
                    name: 'qualityTarget',
                    type: 'string'
                },
                {
                    name: 'projectLeader',
                    type: 'string'
                },
                {
                    name: 'projectStatus',
                    type: 'string'
                },
                {
                    name: 'qualification',
                    type: 'string'
                },
                {
                    name: 'constructionUnit',
                    type: 'string'
                }
            ],
            pageSize: 20,// 每页显示数量。此处设置可以在向后台申请数据的时候“自动”传参一个
            // limit和satrt，start不需要指定ExtJS会自动计算，然后传值。
            proxy: {
                type: 'ajax',// 使用传输方式为ajax（ajax是异步执行的操作，即不需要刷新页面即可申请后台资源。）
                method: 'POST',// post和get是HTML中表单（form）提交两种方式，get会在地址栏显示参数，post不显示
                url: '/Training/myProjectInfoController/getAllProjectInfo.action?deptId='
                    + 0,

                reader: {// 设置读取方式属性
                    type: 'json',// 设置读取方式格式为：json字符串
                    root: 'root',// 设置根元素，即读取上面fields种的name中对应值的元素，此处多为元素组，json字符串如：{A:a,B:[{},{},{},………………]}
                    totalProperty: 'totalProperty'// 设置总页码
                }
            },
            autoLoad: true
            // 自动读取，即显示绑定该store的组件的时候直接读取数据
        });
        // 创建临时Store结束

        // 创建分页bar组建
        var pagebar = Ext.create('Ext.toolbar.Paging', {
            pageSize: 20,
            store: theStore,
            dock: 'bottom',
            setActive: false,
            refresh: false,
            displayInfo: true,
            plugins: Ext.create('Ext.ux.ProgressBarPager', {})
        });
        // 创建分页bar组建结束

        // 为theGirdPanel创建一个SelectionModel
        var selectionModeltoGridPanel = Ext.create('Ext.selection.CheckboxModel'); // 想要能进行选择或者多选，就需要设置selModel属性这是设置selection的模型，创建一个模型Ext.selection.CheckboxModel
        // 初始化gridPanel
        dataPanel = Ext.create('Ext.ux.LiveSearchGridPanel', {
            title: '<font color=red>工程详细信息</font>',
            region: 'center',
            width: '100%',
            height: '96%',
            store: theStore,
            selModel: selectionModeltoGridPanel,
            // 一系列行，不解释，也可以var column=[`````````]然后columns:column
            iconCls: 'remove',
            columns: [
                {
                    dataIndex: 'projectId',
                    width: 80,
                    text: '项目号'
                },
                {
                    dataIndex: 'projectCode',
                    width: 80,
                    text: '项目序号'
                },
                {
                    dataIndex: 'projectName',
                    width: 100,
                    text: '项目名称'
                },
                {
                    dataIndex: 'constructionUnit',
                    width: 100,
                    text: '建设单位'
                },
                {
                    dataIndex: 'startDate',
                    width: 80,
                    text: '开工日期'
                },
                {
                    dataIndex: 'endDate',
                    width: 80,
                    text: '竣工日期'
                },
                {
                    dataIndex: 'qualityTarget',
                    width: 100,
                    text: '质量目标'
                },
                {
                    dataIndex: 'projectLeader',
                    width: 100,
                    text: '项目负责人'
                },
                {
                    dataIndex: 'projectStatus',
                    width: 80,
                    text: '项目状态'
                },
                {
                    dataIndex: 'qualification',
                    width: 80,
                    text: '需要资质'
                }
            ],
            dockedItems: [buttonBar, pagebar]
        });

        // 绑定dataPanel鼠标双击事件。
        dataPanel.on('itemdblclick', function () {
            moduleObj.proAction("update", dataPanel, workerPanel);

        });
        // 初始化gridPanel结束

        // 为下面的部门信息分类栏（grid）创建一个store数据用jsonu读取/Training/DeptInfoController/getAllDeptInfo.action地址申请到的资源。
        deptStore = Ext.create('Ext.data.Store', {
            fields: [
                {
                    name: 'deptId',
                    type: 'String'
                },
                {
                    name: 'deptName',
                    type: 'String'
                }
            ],
            proxy: {
                type: 'ajax',
                method: 'POST',
                url: '/Training/DeptInfoController/getAllDeptInfo.action',
                reader: {
                    type: 'json',// 用json字符串
                    root: 'root'
                }
            },
            autoLoad: true
        });

        // 创建部门信息分类栏，
        workerPanel = Ext.create('Ext.grid.Panel', {
            title: '部门信息',
            border: false,
            store: deptStore,
            hideHeaders: true,
            columns: [
                {
                    dataIndex: 'deptId',
                    hidden: true,
                    sortable: false,
                    width: 180
                },
                {
                    dataIndex: 'deptName',
                    sortable: false,
                    width: 180
                }
            ]
        });

        // 给部门信息的grid绑定事件，当单击的时候触发事件，此事件用来刷新右侧列表
        workerPanel.on('itemclick', function (grid, record) {
            // 获取当前行的deptId列的值
            var id = record.data.deptId;
            // dataPanel.store：获取dataPanel的store属性的值，dataPanel.store.proxy获取数据来源属性，ataPanel.store.proxy.url获取数据来源属性的URL，
            // 这个方法用来重新设置数据来源的地址，
            // 注意：后面的?deptId是HTML传参方法，地址栏传参。跟form直接传参一样，后台可以接受。
            dataPanel.store.proxy.url = '/Training/myProjectInfoController/getAllProjectInfo.action?deptId='
                + id;
            dataPanel
                .setTitle("<font color=red>"
                    + (workerPanel.getSelectionModel().getSelection())[0].data.deptName
                    + "</font>部门信息");// ExtJS中的标题等字符串属性支持HTML语言，直接设置格式。
            dataPanel.store.load();// dataPanel.store：获取dataPanel的store属性的值，dataPanel.store.load()：调用取得的值的load()方法,用来重新加载store数据，实现grid刷新
        });

        // 初始工人信息Panel，同下
        workerPane2 = Ext.create('Ext.grid.Panel', {// Ext.grid.Panel可以直接显示grid的panel不需要create一个Grid放置panel中
            title: 'BBBBBB',// 随便取标题
            border: false,// 没有边框
            store: theStore,
            hideHeaders: true,
            columns: [
                {
                    dataIndex: 'projectName',
                    sortable: false,// 不能排序
                    width: 180
                }
            ]
        });
        // 初始工人信息Panel，用来实现折叠效果的panel
        workerPanel3 = Ext.create('Ext.grid.Panel', {// Ext.grid.Panel可以直接显示grid的panel不需要create一个Grid放置panel中
            title: 'CCCCCCC',// 随便取标题
            border: false,// 没有边框
            store: theStore,
            hideHeaders: true,// 隐藏grid每列数据的标题
            columns: [
                {
                    dataIndex: 'projectName',
                    sortable: false,// 不能排序
                    width: 180
                }
            ]
        });

        // 左边伸缩栏
        westPanel = Ext.create("Ext.panel.Panel", {
            collapsible: true,// 这个属性设置此panel容易可以隐藏（最小化）
            title: '分类查看',
            layout: 'accordion',// 这个属性设置此panel容易可以实现折叠效果
            width: 200,
            region: 'west',
            iconCls: 'reset',
            items: [workerPanel, workerPane2, workerPanel3]
            // 放置三个小panel容器，如上定义
        });

        // 创建容器，用来存放整个窗体的组件，并且在下面直接放置到win中。
        theContainer = Ext.create('Ext.container.Container', {
            layout: 'border',
            items: [dataPanel, westPanel]
        });

        // 判断是否已经创建最外边窗体，如果创建了，（JS是弱类型语言，认为null相当于false）
        if (!win) {
            win = desktop.createWindow({ // 所以此处的目的是：如果win已经初始化存在了，那么就不新创建窗体，直接调用下面的show（）方法
                // 下面属性不具体解释，详细可以查看API手册
                id: 'defaultsWindow-win',
                title: '工程详细信息设置',
                width: 1100,
                height: 600,
                iconCls: 'icon-grid',
                animCollapse: false,
                constrainHeader: true,
                layout: 'fit',
                items: [theContainer]
                // 把创建好存放所有组件的窗体放置到外围窗体中
            });
        }
        win.show();// 显示窗体。
        return win;// 把窗体的句柄（相当于内存引用）返回
    },
    // 创建窗体的方法结束

    // 显示一个对话框的方法，暂时带有一个用来判断是什么按钮的属性
    proAction: function (btn, dataPanel, workerPanel) {
        var selectData;// 预设一个用来存放被选中的数据的变量
        var innerPanel;
        // 如果选择的是复制
        if ("copy" == btn) {
            if (dataPanel.getSelectionModel().getSelection().length == 0) {
                Ext.hx.msg("提示", "请先选择您要复制的行");
                return;
            }

            selectData = (dataPanel.getSelectionModel().getSelection())[dataPanel
                .getSelectionModel().getCount()
                - 1].data;// 如果是删除的话需要读取被选中的数据，就初始化被selectData。
        }
        // 如果选择的是新建
        if ("create" == btn) {
            // 新建的时候设置选择的行为null，没有值。也就不会在创建的panel中显示当前行。此处是因为在复制的时候会去读取。
            selectData = null;
        }

        // 如果选择的是复制
        if ("update" == btn) {
            selectData = (dataPanel.getSelectionModel().getSelection())[0].data;// 先取出所有的记录组成的数组。
        }

        // 如果选择的是删除
        if ("delete" == btn) {
            var oneDate;// 预设一个用来存放一条数据进行操作的变量
            var records = dataPanel.getSelectionModel().getSelection();// 先取出所有的记录组成的数组。
            // 判断如果还没有选择任何行就提示并且返回方法
            if (records.length == 0) {
                Ext.hx.msg("提示", "请先选择您要删除的行");
                return;
            }

            // 遍历所有的数组然后设置里面的各种标志
            var array = new Array();// 预设一个用来存放新的data的数组
            for (var i = 0; i < records.length; i++) {
                oneDate = records[i].data;// 取出其中一条
                oneDate.deleteFlg = true;// 设置删除标志
                array.push(oneDate);// 放置到数组中
            }

            // 用ajax来进行后台交互
            Ext.Ajax.request({
                url: '/Training/myProjectInfoController/deleteProjectInfo.action',
                method: 'POST',
                success: function (res, opts) {// 交互成功的时候
                    Ext.hx.msg("提示", '删除成功!');// 提示
                    dataPanel.store.load();// 表格数据刷新
                },
                failure: function (res, opts) {
                    Ext.hx.msg("提示", '删除失败!');
                },
                params: {
                    jsonString: Ext.JSON.encode(array)
                    // 调用ExtJS内置对象的方法，把数组转换成json字符串
                },
                scope: this
                // 作用范围本页。//具体不知道，没用。、
            });

            return;// 执行完成操作马上返回，不执行下面代码。
        }

        /* 下面定义一系列用来输入的文本框 */
        deptBoxStore = Ext.create('Ext.data.Store', {
            fields: [
                {
                    name: 'deptId',
                    type: 'String'
                },
                {
                    name: 'deptName',
                    type: 'String'
                }
            ],
            proxy: {
                type: 'ajax',
                method: 'POST',
                url: '/Training/DeptInfoController/getAllDeptInfo.action',
                reader: {
                    type: 'json',// 用json字符串
                    root: 'root'
                }
            },
            autoLoad: true
        });
        // 下面是一个下来选择菜单，用来下拉选择部门。
        var dptBox = Ext.create("Ext.form.field.ComboBox", {
            fieldLabel: '部门选择',
            store: deptBoxStore,
            displayField: 'deptName',
            valueField: 'deptId',
            allowBlank: false,// 不允许为空
            editable: false,// 不允许编辑
            x: 10,
            y: 20
        });
        //设置上面部门选择的Combox默认值
        deptBoxStore.load({
            callback: function (records) {
                dptBox.setValue(workerPanel.getSelectionModel().getSelection().length == 0 ? null : (workerPanel.getSelectionModel().getSelection())[0].data.deptId);
            }
        });

        // 各种输入框，制定value（默认值）在没有selectData是null（即if ("create" ==
        // btn)的时候）设置为“”（空字符串），否则分别取出选择行的每一个数据。作为默认数据，
        var projectIdField = Ext.create('Ext.form.field.Text', {
            fieldLabel: '项目号',

            x: 10,
            y: 20,
            value: selectData != null ? selectData.projectId : ""
        });
        var projectCodeField = Ext.create('Ext.form.field.Text', {
            fieldLabel: '项目序号',

            x: 10,
            y: 50,
            value: selectData != null ? selectData.projectCode : ""
        });
        var projectNameField = Ext.create('Ext.form.field.Text', {
            fieldLabel: '项目名称',
            allowBlank: false,
            blankText: '不可以为空',

            x: 10,
            y: 80,
            value: selectData != null ? selectData.projectName : ""
        });
        var constructionUnitField = Ext.create('Ext.form.field.Text', {
            fieldLabel: '建设单位',

            x: 10,
            y: 110,
            value: selectData != null
                ? selectData.constructionUnit
                : ""
        });
        var startDateField = Ext.create('Ext.form.field.Date', {
            format: 'Y-m-d h:m:s ',
            fieldLabel: '开工日期',
            blankText: '不可以为空',
            allowBlank: false,

            x: 10,
            y: 140,
            value: selectData != null
                ? selectData.startDate
                : new Date()
        });
        var endDateField = Ext.create('Ext.form.field.Date', {
            format: 'Y-m-d h:m:s ',
            fieldLabel: '竣工日期',
            blankText: '不可以为空',
            allowBlank: false,

            x: 10,
            y: 170,
            value: selectData != null
                ? selectData.endDate
                : new Date()
        });
        var qualityTargetField = Ext.create('Ext.form.field.Text', {
            fieldLabel: '质量目标',

            x: 10,
            y: 200,
            value: selectData != null ? selectData.qualityTarget : ""
        });
        var projectLeaderField = Ext.create('Ext.form.field.Text', {
            fieldLabel: '项目负责人',

            x: 10,
            y: 230,
            value: selectData != null ? selectData.projectLeader : ""
        });
        var projectStatusField = Ext.create('Ext.form.field.Text', {
            fieldLabel: '项目状态',

            x: 10,
            y: 260,
            value: selectData != null ? selectData.projectStatus : ""
        });
        var qualificationField = Ext.create('Ext.form.field.Text', {
            fieldLabel: '需要资质',

            x: 10,
            y: 290,
            value: selectData != null ? selectData.projectStatus : ""
        });

        var submitButton = Ext.create('Ext.button.Button', {
            text: '确定',
            x: 10,
            y: 320,
            value: selectData != null ? selectData.projectStatus : "",
            handler: function () {
                var arr = new Array();
                // 上面说道的JS的定义对象的方法，
                /**
                 * ####################################### 注意JS中有如下语法： var
                 * object={ paramter1:value1, paramter2:value2, paramter3:value3 }
                 * object.paramter1可以直接获得value1
                 * #####################################
                 */
                var data = {
                    projectId: projectIdField.getValue(),
                    projectCode: projectCodeField.getValue(),
                    projectName: projectNameField.getValue(),
                    constructionUnit: constructionUnitField.getValue(),
                    startDate: startDateField.getValue(),
                    endDate: endDateField.getValue(),
                    qualityTarget: qualityTargetField.getValue(),
                    projectLeader: projectLeaderField.getValue(),
                    projectStatus: projectStatusField.getValue(),
                    qualification: qualificationField.getValue(),
                    deptId: dptBox.getValue(),
                    modifyFlg: "update" == btn ? true : false
                };

                // 上面定义的data有了projectId，projectCode，······deptId，modifyFlg这些属性，可以直接data.modifyFlg取得值。
                if (!confirm("确定？")) {// confirm("确定？")弹出对话框，显示确定？点击是的时候返回true，此处判断如果端机否，直接返回方法不执行下面语句。
                    return;
                }
                arr.push(data);// 把设置好属性的data对象放置到arr数组中。

                // 用AJAX跟后台交互。
                Ext.Ajax.request({
                    url: '/Training/myProjectInfoController/saveProjectInfo.action',
                    params: {
                        jsonString: Ext.JSON.encode(arr)
                    },
                    success: function (response) {
                        Ext.hx.msg("提示", "成功");
                        var dialog = Ext.getCmp('theDialog');// Ext.getCmp（String
                        // comID）;传入组件ID，返回组件句柄（内存引用）
                        dataPanel.store.load(); // 刷新panel不解释
                        dialog.close();// 把窗体关闭（不显示）
                        dialog.destroy();// 把窗体销毁（清空内存）
                    },
                    failure: function (response) {// 失败提示
                        Ext.hx.msg("提示", "失败");
                    }
                });
            }
        });
        var resetButton = Ext.create('Ext.button.Button', {
            text: '重置',
            x: 70,
            y: 320,
            value: selectData != null ? selectData.projectStatus : "",
            handler: function () {
                /*
                 * API上抄来的，不知道什么意思。 up( String selector ) : Container
                 * Walks up the ownerCt axis looking for an ancestor
                 * Container which matches the passed simple selector.
                 */
                this.up('form').getForm().reset();// 查找form上面的form（记住这么用吧，说不清楚。仔细看
                // innerPanel =
                // Ext.create('Ext.form.Panel',
                // {
                // 这句就知道了。）向上找form元素获取form表单，然后重置
            }
        });

        // 创建用来进行输入的文本框数组
        /**
         * 此处使用的是Ext.form.Panel目的是为了上面的this.up('form').getForm().reset();
         */
        innerPanel = Ext.create('Ext.form.Panel', {// 创建一个表单控件，
            id: 'innerPanel',
            height: "100%",
            width: "100%",
            layout: {
                type: 'absolute'
            },
            id: 'innerPanel',
            waitMsgTarget: true,// 显示错误提示的小叹号

            fieldDefaults: {
                labelWidth: 85,
                msgTarget: 'side'// 错误提示的字体
            },
            items: [dptBox, projectCodeField, projectNameField,
                constructionUnitField, startDateField, endDateField,
                qualityTargetField, projectLeaderField, projectStatusField,
                qualificationField, submitButton, resetButton]
        });

        // 准备好一个用来显示窗体的dialog，实际上是一个窗体
        var dlalog = Ext.create('Ext.window.Window', {
            id: 'theDialog',
            title: '要点击之后显示的窗体',
            height: 500,
            width: 300,
            layout: 'fit',
            items: [innerPanel],
            modal: true
            // 模态窗体，显示的时候不允许操作后面的控件。
        });
        dlalog.show();
    }
    // 显示一个对话框的方法结束
});
/**
 * Created by Administrator on 2015/9/8.
 */
