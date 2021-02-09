if (!Catman && mw.config.get("wgNamespaceNumber") >= 0 && mw.config.get("wgIsProbablyEditable")) {
    var Catman = {};
    mw.loader.using(["oojs-ui-core", "oojs-ui-windows", "oojs-ui-widgets", "oojs-ui.styles.icons-moderation", "oojs-ui.styles.icons-interactions", "oojs-ui.styles.icons-editing-core"], function () {
        Catman.start = function () {
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
                    icon: 'check',
                    action: 'next',
                    disabled: false
                },
                {
                    flags: 'safe',
                    icon: 'close',
                    action: 'back',
                    disabled: false
                }
            ]
            CatManDialog.prototype.getActionProcess = function (action) {
                var categoriestoadd, categoriestoremove, summary, presummary, wikitext;
                switch (action) {
                    case 'next':
                        return new OO.ui.Process(function () {
                            try {
                                categoriestoadd = [];
                                $(".catman-addcategory").each(function () {
                                    categoriestoadd.push($(this).find(".catman-categoryname").text());
                                });
                                categoriestoremove = [];
                                $(".catman-remove").each(function () {
                                    categoriestoremove.push($(this).find(".catman-categoryname").text());
                                });
                                summary = Catman.esinput.getValue();
                                presummary = "[[wikipedia:User:Awesome Aasim/CatMan|CatMan]]: "
                                if (categoriestoadd.length == 0 && categoriestoremove.length == 0) {
                                    throw new OO.ui.Error("No categories to add or remove.", { warning: true, recoverable: true });
                                }
                                return $.get(mw.config.get("wgScriptPath") + "/api.php", {
                                    action: "parse",
                                    format: "json",
                                    page: mw.config.get("wgPageName"),
                                    prop: "wikitext"
                                }).then(function (result, status) {
                                    if (status != 'success') {
                                        throw new OO.ui.Error("Connection failed. Please check your Internet and try again.", {recoverable: true});
                                    }
                                    wikitext = result.parse.wikitext["*"];
                                    for (var i in categoriestoremove) {
                                        for (var j in Catman.catprefixes) {
                                            if (wikitext.search("\\[\\[" + Catman.catprefixes[j][0].toUpperCase() + Catman.catprefixes[j].slice(start = 1) + ":" + categoriestoremove[i] + "\\]\\]") >= 0 || wikitext.search("\\[\\[" + Catman.catprefixes[j][0].toLowerCase() + Catman.catprefixes[j].slice(start = 1) + ":" + categoriestoremove[i] + "\\]\\]") >= 0) {
                                                presummary += "-cat [[Category:" + categoriestoremove[i] + "|" + categoriestoremove[i] + "]]"
                                            }
                                            if (i != categoriestoremove.length - 1) {
                                                presummary += ", "
                                            }
                                            while (wikitext.search("\\[\\[" + Catman.catprefixes[j][0].toUpperCase() + Catman.catprefixes[j].slice(start = 1) + ":" + categoriestoremove[i] + "\\]\\]") >= 0) {
                                                wikitext = wikitext.replace("[[" + Catman.catprefixes[j][0].toUpperCase() + Catman.catprefixes[j].slice(start = 1) + ":" + categoriestoremove[i] + "]]", "");
                                            }
                                            while (wikitext.search("\\[\\[" + Catman.catprefixes[j][0].toLowerCase() + Catman.catprefixes[j].slice(start = 1) + ":" + categoriestoremove[i] + "\\]\\]") >= 0) {
                                                wikitext = wikitext.replace("[[" + Catman.catprefixes[j][0].toLowerCase() + Catman.catprefixes[j].slice(start = 1) + ":" + categoriestoremove[i] + "]]", "");
                                            }
                                        }
                                    }
                                    if (categoriestoadd.length > 0 && categoriestoremove.length > 0) {
                                        presummary += "; "
                                    }
                                    for (var i in categoriestoadd) {
                                        for (var j in Catman.catprefixes) {
                                            if (wikitext.search("\\[\\[" + Catman.catprefixes[j][0].toUpperCase() + Catman.catprefixes[j].slice(start = 1) + ":" + categoriestoadd[i] + "\\]\\]") < 0 && wikitext.search("\\[\\[" + Catman.catprefixes[j][0].toLowerCase() + Catman.catprefixes[j].slice(start = 1) + ":" + categoriestoadd[i] + "\\]\\]") < 0) {
                                                presummary += "+cat [[Category:" + categoriestoadd[i] + "|" + categoriestoadd[i] + "]]"
                                            }
                                            if (i != categoriestoadd.length - 1) {
                                                presummary += ", "
                                            }
                                            while (wikitext.search("\\[\\[" + Catman.catprefixes[j][0].toUpperCase() + Catman.catprefixes[j].slice(start = 1) + ":" + categoriestoadd[i] + "\\]\\]") < 0 && wikitext.search("\\[\\[" + Catman.catprefixes[j][0].toLowerCase() + Catman.catprefixes[j].slice(start = 1) + ":" + categoriestoadd[i] + "\\]\\]") < 0) {
                                                wikitext += "\n[[" + Catman.catprefixes[j][0].toUpperCase() + Catman.catprefixes[j].slice(start = 1) + ":" + categoriestoadd[i] + "]]";
                                                break;
                                            }
                                        }
                                    }
                                    if (summary) {
                                        presummary += " (reason: " + summary + ")"
                                    }
                                    return $.get(mw.config.get("wgScriptPath") + "/api.php", {
                                        action: "query",
                                        format: "json",
                                        meta: "tokens",
                                        type: "csrf"
                                    }).then(function (result, status) {
                                        if (status != 'success') {
                                            throw new OO.ui.Error("Connection failed. Please check your Internet and try again.", {recoverable: true});
                                        }
                                        if (result.error) {
                                            throw new OO.ui.Error(result.error.info, { recoverable: true });
                                        } else {
                                            return $.post(mw.config.get("wgScriptPath") + "/api.php", {
                                                action: "edit",
                                                format: "json",
                                                title: mw.config.get("wgPageName"),
                                                token: result.query.tokens.csrftoken,
                                                text: wikitext,
                                                summary: presummary
                                            }).then(function (result, status) {
                                                if (status != 'success') {
                                                    throw new OO.ui.Error("Connection failed. Please check your Internet and try again.", {recoverable: true});
                                                }
                                                if (result.error) {
                                                    throw new OO.ui.Error(result.error.info, { recoverable: true });
                                                } else {
                                                    Catman.windowManager.closeWindow('catmandialog');
                                                    Catman.windowManager.$element.remove();
                                                    mw.notify("Categories successfully edited. Reloading...");
                                                    location.reload();
                                                }
                                            });
                                        }
                                    });
                                });
                            } catch (error) {
                                return error;
                            }
                        }, this);
                    case 'back': return new OO.ui.Process(function () {
                        Catman.windowManager.closeWindow('catmandialog');
                        Catman.windowManager.$element.remove();
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
                var catinput = new OO.ui.TextInputWidget({ placeholder: "Enter category name" });
                var catinputsubmit = new OO.ui.ButtonWidget({ flags: ["primary", "progressive"], icon: "add" })
                var esinput = new OO.ui.TextInputWidget({ placeholder: "Edit summary" });
                var catpage = new CategoriesLayout('categories', { expanded: false });
                var sumpage = new SummaryLayout('summary', { expanded: false });
                var index = new OO.ui.IndexLayout({ expanded: true });
                index.addTabPanels([catpage, sumpage]);
                this.content.$element.append('<span id="catman-loading"><p></p></span><span id="catman"></span>');
                this.$body.append(this.content.$element);
                var progressBar = new OO.ui.ProgressBarWidget( {
                    progress: false,
                    padded: true
                });
                $("#catman-loading").find("p").html(progressBar.$element);
                $("#catman").hide();
                $("#catman").html(index.$element);
                var catinputset = new OO.ui.FieldsetLayout();
                catinputset.addItems([
                    new OO.ui.ActionFieldLayout(catinput, catinputsubmit)
                ]);
                $("#catman-categories").append(catinputset.$element);
                $("#catman-summary").append(esinput.$element);
                var categorylist = mw.config.get("wgCategories");
                Catman.catinput = catinput;
                Catman.catinputsubmit = catinputsubmit;
                Catman.esinput = esinput;
                Catman.catpage = catpage;
                Catman.sumpage = sumpage;
                Catman.index = index;
                Catman.catinputset = catinputset;
                $.get(mw.config.get("wgScriptPath") + "/api.php", {
                    action: "parse",
                    format: "json",
                    page: mw.config.get("wgPageName"),
                    prop: "wikitext"
                }).then(function (result, status) {
                    if (status != "success") {
                        Catman.windowManager.closeWindow('catmandialog');
                        Catman.windowManager.$element.remove();
                        OO.ui.alert('Failed to load CatMan.');
                    }
                    //find all category links on the page
                    var text = result.parse.wikitext["*"];
                    var catprefixes = [];
                    for (var i in mw.config.get("wgNamespaceIds")) {
                        if (mw.config.get("wgNamespaceIds")[i] == 14) {
                            catprefixes.push(i);
                        }
                    }
                    Catman.catprefixes = catprefixes;
                    var editablelist = [];
                    for (var i of catprefixes) {
                        editablelist = Catman.getEditableCategories(text, i);
                    }
                    Catman.list = editablelist;
                    var uneditablelist = [];
                    for (var i in categorylist) {
                        var editablecategory = false;
                        for (var j in editablelist) {
                            if (categorylist[i] == editablelist[j]) {
                                editablecategory = true;
                                break;
                            }
                        }
                        if (!editablecategory) {
                            uneditablelist.push(categorylist[i]);
                        }
                    }
                    $("#catman-categories").append("<style>\n.catman-remove {\ntext-decoration:line-through;\n}</style>")
                    $("#catman-categories").append("<table style=\"width:100%\"><caption><b>Categories you can edit</b></caption><tbody id=\"catman-table\"></tbody></table>");
                    for (var i of editablelist) {
                        var $el = $("<tr class=\"catman-category catman-currentcategory\"><td class=\"catman-categoryname\"><a href=\"" + mw.config.get("wgArticlePath").replace("$1", "Category:" + i) + "\">" + i + "</a></td><td class=\"catman-categoryremove\"></td></tr>")
                        $("#catman-table").append($el);
                        var removeCat = new OO.ui.ButtonWidget({
                            icon: 'trash',
                            flags: 'destructive'
                        });
                        $el.find(".catman-categoryremove").append(removeCat.$element);
                        removeCat.$element.click(function (e) {
                            e.preventDefault();
                            if ($(this).parent().parent().hasClass("catman-currentcategory")) {
                                $(this).parent().parent().addClass("catman-remove");
                                $(this).hide();
                            } else {
                                $(this).parent().parent().remove();
                            }
                        });
                    }
                    if (uneditablelist.length > 0) {
                        $("#catman-categories").append("<table style=\"width:100%\"><caption><b>Categories you cannot edit</b> (<span title=\"These categories cannot be edited with CatMan because they are automatically added with templates or magic words. To remove these categories, remove the templates or magic words that populate these categories.\" style=\"text-decoration-line:underline;text-decoration-style:dotted;\">?</span>)</caption><tbody id=\"catman-uneditable\"></tbody></table>");
                        for (var i of uneditablelist) {
                            var $el = $("<tr><td><a href=\"" + mw.config.get("wgArticlePath").replace("$1", "Category:" + i) + "\">" + i + "</a></td></tr>")
                            $("#catman-uneditable").append($el);
                        }
                    }
                    Catman.addCat = function (e) {
                        e.preventDefault();
                        if (catinput.getValue().length > 0) {
                            var $el = $("<tr class=\"catman-category catman-addcategory\"><td class=\"catman-categoryname\"><a href=\"" + mw.config.get("wgArticlePath").replace("$1", "Category:" + catinput.getValue()) + "\">" + catinput.getValue() + "</a></td><td class=\"catman-categoryremove\"></td></tr>")
                            $("#catman-table").append($el);
                            var removeCat = new OO.ui.ButtonWidget({
                                icon: 'trash',
                                flags: 'destructive'
                            });
                            $el.find(".catman-categoryremove").append(removeCat.$element);
                            removeCat.$element.click(function (e) {
                                e.preventDefault();
                                if ($(this).parent().parent().hasClass("catman-currentcategory")) {
                                    $(this).parent().parent().addClass("catman-remove");
                                    $(this).hide();
                                } else {
                                    $(this).parent().parent().remove();
                                }
                            });
                            catinput.setValue("");
                        }
                        $(".catman-categoryname").each(function() {
                            var that = this;
                            $.get(mw.config.get("wgScriptPath") + "/api.php", {
                                action: "parse",
                                format: "json",
                                page: "Category:" + $(this).text()
                            }).done(function(result) {
                                if (result.error) {
                                    if (result.error.code == "missingtitle") {
                                        $(that).find("a").addClass("new");
                                    }
                                }
                            });
                        });
                    }
                    catinput.$element.keypress(function(e) {
                        if (e.which == 13) {
                            Catman.addCat(e);
                        }
                    });
                    catinputsubmit.$element.click(Catman.addCat);
                    $(".catman-categoryname").each(function() {
                        var that = this;
                        $.get(mw.config.get("wgScriptPath") + "/api.php", {
                            action: "parse",
                            format: "json",
                            page: "Category:" + $(this).text()
                        }).done(function(result) {
                            if (result.error) {
                                if (result.error.code == "missingtitle") {
                                    $(that).find("a").addClass("new");
                                }
                            }
                        });
                    });
                    $("#catman").show();
                    $("#catman-loading").hide();
                });
            };
            // Register the window constructor with the factory.
            Catman.factory.register(CatManDialog);

            // Create a window manager. Specify the name of the factory with the ‘factory’ config.
            Catman.windowManager = new OO.ui.WindowManager({
                factory: Catman.factory
            });
            $(document.body).append(Catman.windowManager.$element);
            Catman.windowManager.openWindow('catmandialog', { size: "full" });
        };
        mw.util.addPortletLink('p-tb', 'javascript:Catman.start()', 'Start CatMan', 'pt-catman');
    });
}