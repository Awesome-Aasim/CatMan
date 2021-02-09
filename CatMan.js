/***********************************************************************************
 * CatMan:  The category manager for MediaWiki wikis that is simple, lightweight,  *
 * and modern.  Nya nya.                                                           *
 *                                                                                 *
 * This script is largely a work in progress and may sometimes not work properly.  *
 * Please see the English Wikipedia for known problems that are currently being    *
 * fixed.                                                                          *
 ***********************************************************************************
 * IMPORTANT (particularly for those who are viewing a copy of the script):        *
 * THIS FILE IS AVAILABLE ON GITHUB AT https://github.com/Awesome-Aasim/CatMan     *
 * ALL PULL REQUESTS AND CHANGES MUST BE MADE THERE, OTHERWISE THEY WILL BE LOST   *
 * IF THE FILE AT THE REPOSITORY IS CHANGED OR REBUILT.                            *
 ***********************************************************************************
 * LICENSING INFORMATION: Licensed under the MIT license                           *
 * MIT License                                                                     *
 * Copyright (c) 2021 Aasim Syed                                                   *
 * Permission is hereby granted, free of charge, to any person obtaining a copy    *
 * of this software and associated documentation files (the "Software"), to deal   *
 * in the Software without restriction, including without limitation the rights    *
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell       *
 * copies of the Software, and to permit persons to whom the Software is           *
 * furnished to do so, subject to the following conditions:                        *
 * The above copyright notice and this permission notice shall be included in all  *
 * copies or substantial portions of the Software.                                 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR      *
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,        *
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE     *
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER          *
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,   *
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE   *
 * SOFTWARE.                                                                       *
 ***********************************************************************************/
//<nowiki>
if (!Catman && mw.config.get("wgNamespaceNumber") >= 0 && mw.config.get("wgIsProbablyEditable") && mw.config.get("wgArticleId") > 0) {
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
                /*
                var catlist = mw.config.get("wgCategories");
                var rtn = [];
                for (var i in res) {
                    for (var j in catlist) {
                        if (catlist[j] == res[i]) {
                            rtn.push(res[i]);
                        }
                    }
                }
                */
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
                                                presummary += "-cat [[Category:" + categoriestoremove[i].split("|")[0] + "|" + categoriestoremove[i].split("|")[0] + "]]"
                                            }
                                            if (i != categoriestoremove.length - 1) {
                                                presummary += ", "
                                            }
                                            while (wikitext.search("\\[\\[" + Catman.catprefixes[j][0].toUpperCase() + Catman.catprefixes[j].slice(start = 1) + ":" + categoriestoremove[i] + "\\]\\]") >= 0) {
                                                wikitext = wikitext.replace("[[" + Catman.catprefixes[j][0].toUpperCase() + Catman.catprefixes[j].slice(start = 1) + ":" + categoriestoremove[i] + "]]\n", "");
                                                wikitext = wikitext.replace("[[" + Catman.catprefixes[j][0].toUpperCase() + Catman.catprefixes[j].slice(start = 1) + ":" + categoriestoremove[i] + "]]", "");
                                            }
                                            while (wikitext.search("\\[\\[" + Catman.catprefixes[j][0].toLowerCase() + Catman.catprefixes[j].slice(start = 1) + ":" + categoriestoremove[i] + "\\]\\]") >= 0) {
                                                wikitext = wikitext.replace("[[" + Catman.catprefixes[j][0].toLowerCase() + Catman.catprefixes[j].slice(start = 1) + ":" + categoriestoremove[i] + "]]\n", "");
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
                                                presummary += "+cat [[Category:" + categoriestoadd[i].split("|")[0] + "|" + categoriestoadd[i].split("|")[0] + "]]"
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
            }
            CatManDialog.prototype.initialize = function () {
                CatManDialog.super.prototype.initialize.call(this);
                this.content = new OO.ui.PanelLayout({ padded: false, expanded: false, $overlay: this.$overlay });
                var catinput = new OO.ui.ComboBoxInputWidget({ expanded: false, padded: true, placeholder: "Enter category name", options: [], $overlay: this.$overlay });
                var catinputsubmit = new OO.ui.ButtonWidget({ flags: ["primary", "progressive"], icon: "add", $overlay: this.$overlay })
                var esinput = new OO.ui.TextInputWidget({ placeholder: "Edit summary", $overlay: this.$overlay });
                var catpage = new CategoriesLayout('categories', { expanded: false, $overlay: this.$overlay });
                var sumpage = new SummaryLayout('summary', { expanded: false, $overlay: this.$overlay });
                var index = new OO.ui.IndexLayout({ expanded: true, $overlay: this.$overlay });
                index.addTabPanels([catpage, sumpage]);
                this.content.$element.append('<span id="catman-loading"><p></p></span><span id="catman"></span>');
                this.$body.append(this.content.$element);
                var progressBar = new OO.ui.ProgressBarWidget( {
                    progress: false,
                    padded: true, 
                    $overlay: this.$overlay
                });
                $("#catman-loading").find("p").html(progressBar.$element);
                $("#catman").hide();
                $("#catman").html(index.$element);
                var catinputset = new OO.ui.FieldsetLayout({$overlay: this.$overlay});
                catinputset.addItems([
                    new OO.ui.ActionFieldLayout(catinput, catinputsubmit, {$overlay: this.$overlay})
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
                Catman.$overlay = this.$overlay;
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
                            if (categorylist[i] == editablelist[j].split("|")[0]) {
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
                        var $el = $("<tr class=\"catman-category catman-currentcategory\"><td class=\"catman-categoryname\"><a href=\"" + mw.config.get("wgArticlePath").replace("$1", "Category:" + i.split("|")[0]) + "\">" + i.split("|")[0] + "</a>" + (i.split("|").length > 1 ? "<span title=\"This is a category sort key, used to sort category entries when viewing the page in the category.\" style=\"text-decoration-line:underline;text-decoration-style:dotted;\">|" + i.split("|")[1] + "</span>" : "") + "</td><td class=\"catman-categoryremove\"></td></tr>")
                        $("#catman-table").append($el);
                        var removeCat = new OO.ui.ButtonWidget({
                            icon: 'trash',
                            flags: 'destructive',
                            $overlay: Catman.$overlay,
                            classes: ['catman-categoryremovebutton']
                        });
                        $el.find(".catman-categoryremove").append(removeCat.$element);
                        removeCat.$element.click(function (e) {
                            e.preventDefault();
                            $(this).parent().parent().addClass("catman-remove");
                            $(this).parent().parent().find(".catman-undobutton").show();
                            $(this).hide();
                        });
                        var undoCat = new OO.ui.ButtonWidget({
                            icon: 'undo',
                            $overlay: Catman.$overlay,
                            classes: ['catman-undobutton']
                        });
                        $el.find(".catman-categoryremove").append(undoCat.$element);
                        undoCat.$element.click(function (e) {
                            e.preventDefault();
                            $(this).parent().parent().removeClass("catman-remove");
                            $(this).parent().parent().find(".catman-categoryremovebutton").show();
                            $(this).hide();
                        });
                        undoCat.$element.hide();
                    }
                    if (uneditablelist.length > 0) {
                        $("#catman-categories").append("<table style=\"width:100%\"><caption><b>Categories you cannot edit</b> (<span title=\"These categories cannot be edited with CatMan because they are automatically added with templates or magic words. To remove these categories, remove the templates or magic words that populate these categories.\" style=\"text-decoration-line:underline;text-decoration-style:dotted;\">?</span>)</caption><tbody id=\"catman-uneditable\"></tbody></table>");
                        for (var i of uneditablelist) {
                            var $el = $("<tr><td><a href=\"" + mw.config.get("wgArticlePath").replace("$1", "Category:" + i.split("|")[0]) + "\">" + i + "</a></td></tr>")
                            $("#catman-uneditable").append($el);
                        }
                    }
                    Catman.addCat = function (e) {
                        e.preventDefault();
                        if (catinput.getValue().length > 0) {
                            var $el = $("<tr class=\"catman-category catman-addcategory\"><td class=\"catman-categoryname\"><a href=\"" + mw.config.get("wgArticlePath").replace("$1", "Category:" + catinput.getValue().split("|")[0]) + "\">" + catinput.getValue().split("|")[0] + "</a>" + (catinput.getValue().split("|").length > 1 ? "<span title=\"This is a category sort key, used to sort category entries when viewing the page in the category.\" style=\"text-decoration-line:underline;text-decoration-style:dotted;\">|" + catinput.getValue().split("|")[1] + "</span>" : "") + "</td><td class=\"catman-categoryremove\"></td></tr>")
                            $("#catman-table").append($el);
                            var removeCat = new OO.ui.ButtonWidget({
                                icon: 'trash',
                                flags: 'destructive',
                                $overlay: Catman.$overlay
                            });
                            $el.find(".catman-categoryremove").append(removeCat.$element);
                            removeCat.$element.click(function (e) {
                                e.preventDefault();
                                $(this).parent().parent().remove();
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
                        } else {
                            var key = e.which || e.keyCode;
                            if (key == 91 || key == 93 || (catinput.getValue() == "" && key == 32) || (catinput.getValue().search("\\|") >= 0 && key == 124) || (catinput.getValue() == "" && key == 124) || key == 35 || key == 123 || key == 125 || key == 60 || key == 62) { // stop the input of forbidden wikitext characters (except for pipe which is used for category sorting)
                                e.preventDefault();
                            }
                        }
                    });
                    window.setInterval(function(e) {
                        //populate the combobox
                        var searchterm = catinput.getValue();
                        var splitsearch = searchterm.split("|");
                        $.get(mw.config.get("wgScriptPath") + "/api.php", {
                            "action": "query",
                            "format": "json",
                            "list": "search",
                            "utf8": 1,
                            "srsearch": splitsearch[0],
                            "srnamespace": "14"
                        }).then(function(result, status) {
                            if (status == "success") {
                                if (result.error) {
                                    catinput.setOptions([]);
                                } else {
                                    var options = [], searchresults = result.query.search;
                                    var restofsearchterm = "";
                                    for (var i in splitsearch) {
                                        if (i != 0) {
                                            restofsearchterm += splitsearch[i];
                                        }
                                        if (i != splitsearch.length - 1) {
                                            restofsearchterm += "|";
                                        }
                                    }
                                    for (var i in searchresults) {
                                        options.push({data: searchresults[i].title.split(":")[1] + restofsearchterm, label: searchresults[i].title.split(":")[1]});
                                    }
                                    if (options.length == 0) {
                                        options.push({data: searchterm, label: "No results found."})
                                    }
                                    catinput.setOptions(options);
                                }
                            }
                        })
                    }, 1000);
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
        if (mw.config.get("skin") == "minerva") {
            mw.util.addPortletLink('p-tb', 'javascript:Catman.start()', 'Start CatMan', 'pt-catman');
        } else {
            mw.util.addPortletLink('p-cactions', 'javascript:Catman.start()', 'Start CatMan', 'pt-catman');
        }
    });
}
//</nowiki>