if (!Catman) {
    var Catman = {};
    mw.loader.using(["oojs-ui-core", "oojs-ui-windows", "oojs-ui-widgets", "oojs-ui.styles.icons-moderation", "oojs-ui.styles.icons-interactions"], function () {
        Catman.start = function () {
            Catman.windowManager.openWindow('catmandialog', { size: "full" });
        };
        mw.util.addPortletLink('p-cactions', 'javascript:Catman.start()', 'Start CatMan', 'pt-catman');
        // Create a factory.
        Catman.factory = new OO.Factory();
        Catman.getEditableCategories = function (text, categoryname = "Category") {
            categoryname = categoryname[0].toUpperCase() + categoryname.slice(start = 1);
            var temp = text.split("[[");
            var res = []
            for (var i in temp) {
                if (temp[i].startsWith(categoryname + ":")) {
                    res.push(temp[i].split("]]")[0].slice(start = categoryname.length + 1));
                }
            }
            return res;
        }
        function CatManDialog(config) {
            CatManDialog.super.call(this, config);
        }
        OO.inheritClass(CatManDialog, OO.ui.ProcessDialog);
        CatManDialog.static.name = 'catmandialog';
        CatManDialog.static.title = 'Category Manager';
        CatManDialog.static.actions = [
            {
                flags: ['primary', 'progressive'],
                label: 'Update',
                action: 'next',
                disabled: true
            },
            {
                flags: 'safe',
                label: 'Cancel',
                action: 'back',
                disabled: false
            }
        ]
        CatManDialog.prototype.getActionProcess = function (action) {
            switch (action) {
                case 'next': return new OO.ui.Process(function () {

                }, this);
                case 'back': return new OO.ui.Process(function () {
                    Catman.windowManager.closeWindow('catmandialog')
                }, this);
            }
            // Fallback to parent handler
            return CatManDialog.super.prototype.getActionProcess.call(this, action);
        };
        function CategoriesLayout(name, config) {
            CategoriesLayout.super.call(this, name, config);
            this.$element.append('<span id="catman-categories"></span>');
        }
        OO.inheritClass(CategoriesLayout, OO.ui.TabPanelLayout);
        CategoriesLayout.prototype.setupTabItem = function () {
            this.tabItem.setLabel('Categories');
        }
        function SummaryLayout(name, config) {
            SummaryLayout.super.call(this, name, config);
            this.$element.append('<span id="catman-summary"></span>');
        }
        OO.inheritClass(SummaryLayout, OO.ui.TabPanelLayout);
        SummaryLayout.prototype.setupTabItem = function () {
            this.tabItem.setLabel('Edit summary');
        }
        CategoriesLayout.prototype.getBodyHeight = function () {
            return "full";
        }
        SummaryLayout.prototype.getBodyHeight = function () {
            return "full";
        }
        CatManDialog.prototype.getBodyHeight = function () {
            return "full";
        };
        CatManDialog.prototype.initialize = function () {
            CatManDialog.super.prototype.initialize.call(this);
            this.content = new OO.ui.PanelLayout({ padded: false, expanded: false });
            var catinput = new OO.ui.InputWidget({ label: "Enter category name" });
            var esinput = new OO.ui.InputWidget({ label: "Edit summary" });
            var catpage = new CategoriesLayout('categories', { expanded: false });
            var sumpage = new SummaryLayout('summary', { expanded: false });
            var index = new OO.ui.IndexLayout({ expanded: true });
            index.addTabPanels([catpage, sumpage]);
            this.content.$element.append('<span id="catman"></span>');
            this.$body.append(this.content.$element);
            $("#catman").html(index.$element);
            $("#catman-categories").append(catinput.$element);
            $("#catman-summary").append(esinput.$element);
            var categorylist = mw.config.get("wgCategories");
            if (categorylist.length == 0) {
                $("#catman-categories").prepend("<p>No categories yet.  Feel free to add some.</p>");
            } else {
                $.get(mw.config.get("wgScriptPath") + "/api.php", {
                    action: "parse",
                    format: "json",
                    page: mw.config.get("wgPageName"),
                    prop: "wikitext"
                }).done(function (result) {
                    //find all category links on the page
                    var text = result.parse.wikitext["*"];
                    var catprefixes = [];
                    for (var i in mw.config.get("wgNamespaceIds")) {
                        if (mw.config.get("wgNamespaceIds")[i] == 14) {
                            catprefixes.push(i);
                            console.log(catprefixes);
                        }
                    }
                    var editablelist = [];
                    for (var i of catprefixes) {
                        editablelist = Catman.getEditableCategories(text, i);
                    }
                    console.log(editablelist);
                    for (var i of editablelist) {
                        $("#catman-categories").append("<p>" + i + "</p>");
                    }
                }).fail(function () {
                    OO.ui.alert('Failed to load').done(function () {
                        Catman.windowManager.closeWindow('catmandialog');
                    });
                });
            }
        };
        // Register the window constructor with the factory.
        Catman.factory.register(CatManDialog);

        // Create a window manager. Specify the name of the factory with the ‘factory’ config.
        Catman.windowManager = new OO.ui.WindowManager({
            factory: Catman.factory
        });
        $(document.body).append(Catman.windowManager.$element);
    });
}