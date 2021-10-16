const Repository = require('../models/Repository');

module.exports =
    class BookmarksController extends require('./Controller') {
        constructor(req, res) {
            super(req, res);
            this.bookmarksRepository = new Repository('Bookmarks');
        }
        getAll() {
            this.response.JSON(this.bookmarksRepository.getAll());
        }
        get(id) {
            let params = this.getQueryStringParams();

            if (params === null) { //Si params est null
                if (!isNaN(id)) {
                    this.response.JSON(this.bookmarksRepository.get(id));
                }
                else {
                    this.response.JSON(this.bookmarksRepository.getAll());
                }
            }
            else {
                let result = this.bookmarksRepository.getAll()

                if (!isNaN(id)) { //Si il y a des params mais qu'il y a aussi un /id
                    this.response.JSON(this.bookmarksRepository.get(id))
                    return
                }

                if (Object.keys(params).length === 0) { //Si params est vide mais qu'il y a un ?
                    let content = "<div>"
                    content += "<h4>(GET) /api/bookmarks -> voir tous les bookmarks </h4>"
                    content += "<h4>(GET) /api/bookmarks/sort=name -> voir tous les bookmarks trier en ordre alphabetique par name</h4>"
                    content += "<h4>(GET) /api/bookmarks/sort=category -> voir tous les bookmarks trier en ordre alphabetique par category</h4>"
                    content += "<h4>(GET) /api/bookmarks/sort=name,desc -> voir tous les bookmarks trier en ordre alphabetique par name (DESCENDANT)</h4>"
                    content += "<h4>(GET) /api/bookmarks/sort=category,desc -> voir tous les bookmarks trier en ordre alphabetique par category (DESCENDANT)</h4>"
                    content += "<h4>(GET) /api/bookmarks/id -> voir le bookmark Id </h4>"
                    content += "<h4>(GET) /api/bookmarks?name=nom -> voir le bookmark avec Name = nom </h4>"
                    content += "<h4>(GET) /api/bookmarks?name=ab* -> voir tous les bookmarks avec Name commençant par ab</h4>"
                    content += "<h4>(GET) /api/bookmarks?category=sport -> voir tous les bookmarks avec Category = sport</h4>"
                    content += "<h4>(GET) /api/bookmarks? -> Voir la liste des parametres supportes </h4>"
                    content += "<h4>(POST)/api/bookmarks -> Ajout d un bookmark</h4>"
                    content += "<h4>(PUT) /api/bookmarks -> Modifier le bookmark</h4>"
                    content += "<h4>(DELETE) /api/bookmarks/Id -> Effacer le bookmark Id</h4>"
                    content += "</div>"

                    this.res.end(content)
                } else {

                    if ("name" in params)
                        this.name(params, result)

                    else if ("category" in params)
                        this.category(params, result)

                    else if ("sort" in params)
                        this.sort(params, result)

                }
            }
        }

        sort(params, result){
            if (params.sort == "name" || params.sort == "name,desc") {
                result.sort(function (a, b) {
                    a = a.Name.toLowerCase();
                    b = b.Name.toLowerCase();

                    let expressionResult = a < b ? -1 : a > b ? 1 : 0

                    if (params.sort == "name,desc") //Desc
                        expressionResult = b < a ? -1 : b > a ? 1 : 0

                    return expressionResult;
                });

                this.response.JSON(result)
            }
            else if (params.sort == "category" || params.sort == "category,desc") {
                result.sort(function (a, b) {
                    a = a.Category.toLowerCase();
                    b = b.Category.toLowerCase();

                    let expressionResult = a < b ? -1 : a > b ? 1 : 0

                    if (params.sort == "category,desc") //Desc
                        expressionResult = b < a ? -1 : b > a ? 1 : 0

                    return expressionResult;
                });
                
                this.response.JSON(result)
            }
            else {
                this.response.JSON("Invalid Parameters!")
            }
        }

        name(params, result) {

            //Si il y a un *
            if (params.name.includes('*')) {
                result = result.filter(function (item) {
                    return item.Name.includes(params.name.slice(0, -1))
                })
                this.response.JSON(result)
                return
            }

            // Si il n'y a pas de *
            result = result.filter(function (item) {
                return item.Name == params.name
            })

            this.response.JSON(result)
        }

        category(params, result) {
            result = result.filter(function (item) {
                return item.Category == params.category
            })

            this.response.JSON(result)
        }

        post(bookmark) {
            // todo : validate bookmark before insertion

            // Dupplicate or not?
            let dupplicate = false

            this.bookmarksRepository.objectsList.forEach(currentBookmark => {
                if (bookmark.Name == currentBookmark.Name) {
                    dupplicate = true
                }
            });

            if (dupplicate) {
                this.response.badRequest()
                return
            }

            // Empty statement or not?
            if (bookmark.Name == "" || bookmark.Url == "" || bookmark.Usager == "" || bookmark.Category == "" || bookmark.Id == "") {
                this.response.badRequest()
                return
            }

            //No problems, add bookmark
            let newBookmark = this.bookmarksRepository.add(bookmark);
            if (newBookmark)
                this.response.created(JSON.stringify(newBookmark));
            else
                this.response.internalError();
        }
        put(bookmark) {
            if (bookmark.Name == "" || bookmark.Url == "" || bookmark.Usager == "" || bookmark.Category == "" || bookmark.Id == "") {
                this.response.badRequest()
                return
            }

            if (this.bookmarksRepository.update(bookmark)) {
                this.response.ok();
            }
            else
                this.response.notFound();
        }
        remove(id) {
            if (this.bookmarksRepository.remove(id))
                this.response.accepted();
            else
                this.response.notFound();
        }
    }