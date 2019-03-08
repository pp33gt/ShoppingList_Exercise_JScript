"use strict";

(function (listitem, $, undefined) {

    //Public Methods
    listitem.insertItem = function (text, completed) {
        text = text.trim();
        if (text === "") return;

        var li = createLi(text, completed);
        var btn = createButton(li);
        return { button: btn, listitem: li };
    };

    //Private Methods
    function createLi(text, completed) {
        var li = document.createElement("li");
        li.textContent = text;
        if (completed) li.classList.add("completed");
        li.addEventListener("click", () => li.classList.toggle("completed"));
        return li;
    }

    function createButton(li) {
        var btn = document.createElement("button");
        btn.classList.add("remove");
        btn.textContent = "ta bort";
        li.append(btn);
        return btn;
    }

}(window.listitem = window.listitem || {}/*, jQuery*/));

(function (shoppingListsStorage, $, undefined) {

    //Private Properties
    var storageKey = 'shoppingListsKey';
    var inmemoryItems = [];
    var webStorageInUse = null;

    //Public Methods
    shoppingListsStorage.useLocalWebStorage = function () {
        webStorageInUse = window.localStorage;
    }

    shoppingListsStorage.useSessionWebStorage = function () {
        webStorageInUse = window.sessionStorage;
    }

    shoppingListsStorage.clear = function () {
        if (webStorageInUse !== null) {
            webStorageInUse.clear();
        }
        inmemoryItems = [];
    };

    shoppingListsStorage.clearAll = function () {
        window.localStorage.clear();
        window.sessionStorage.clear();
        inmemoryItems = [];
    };

    shoppingListsStorage.getItems = function () {
        if (webStorageInUse === null) {
            return inmemoryItems;
        }
        var resultItems = webStorageInUse.getItem(storageKey);
        return JSON.parse(resultItems);
    };

    shoppingListsStorage.deleteShoppingList = function (listName) {

        if (webStorageInUse === null) {
            var tmpItems = removeShoppingList(inmemoryItems, listName);
            inmemoryItems = tmpItems;
            return;
        }

        var wsItemsJson = webStorageInUse.getItem(storageKey);
        var wsItems = JSON.parse(wsItemsJson);
        wsItems = removeShoppingList(wsItems, listName);
        var wsItemsJson = JSON.stringify(wsItems);
        webStorageInUse.setItem(storageKey, wsItemsJson);
    };

    shoppingListsStorage.setItem = function (listName, shoppingItems) {

        if (webStorageInUse === null) {
            var tmpItems = editOrCreateItems(shoppingListsStorage.items, listName, shoppingItems);
            inmemoryItems = inmemoryItems.concat(tmpItems);
            return;
        }

        var wsItemsJson = webStorageInUse.getItem(storageKey);
        var wsItems = JSON.parse(wsItemsJson);
        wsItems = editOrCreateItems(wsItems, listName, shoppingItems);
        var resultItemsJson = JSON.stringify(wsItems);
        webStorageInUse.setItem(storageKey, resultItemsJson);
    };

    shoppingListsStorage.setItem2 = function (listName, shoppingItems) {

        if (webStorageInUse === null) {
            var tmpItems = editOrCreateItems(inmemoryItems, listName, shoppingItems);
            inmemoryItems = inmemoryItems.concat(tmpItems);
            return;
        }
        
        var wsItemsJson = webStorageInUse.getItem(storageKey);
        var wsItems = JSON.parse(wsItemsJson);
        wsItems = editOrCreateItems(wsItems, listName, shoppingItems);
        var resultItemsJson = JSON.stringify(wsItems);
        webStorageInUse.setItem(storageKey, resultItemsJson);
    };

    shoppingListsStorage.setItems = function (newitems) {
        newitems.forEach((item) => { shoppingListsStorage.setItem(item.name, item.items); });
    };

    shoppingListsStorage.logAllShoppingListsToConsole = function() {
        logAllShoppingListsToConsole();
    }


    //Private Methods
    function logAllShoppingListsToConsole() {
        var wsItems = shoppingListsStorage.getItems();
        wsItems.forEach((shoppingList) => {
            console.log('shoppingList:' + shoppingList.name);
            shoppingList.items.forEach((item) => {
                console.log('item:' + item.name);
            });
        });
    }

    function removeShoppingList(shoppingLists, key) {
        var tmpShoppingLists = [];
        shoppingLists.forEach((item) => { if (item.name !== key) { tmpShoppingLists.push(item); } });
        shoppingLists = tmpShoppingLists;
        return shoppingLists;
    }

    function editOrCreateItems(shoppingLists, key, newValues) {
        var newShoppingLists = [];
        if (shoppingLists) {
            var shoppingList = shoppingLists.find((list) => list.name === key);
            if (shoppingList) {
                shoppingList.items = newValues;
                return shoppingLists;
            }
            else {
                shoppingLists.push({ name: key, items: newValues });
                return shoppingLists;
            }
        }
        newShoppingLists.push({ name: key, items: newValues });
        return newShoppingLists;
    };

}(window.shoppingListsStorage = window.shoppingListsStorage || {}/*, jQuery*/));

(function (dropdown, $, undefined) {

    //Public Propertis
    dropdown.emptyOptionRaw = '&lt;empty&gt;';
    dropdown.emptyOption = '<empty>';

    //Public Methods
    dropdown.clear = function (dropDown) {
        for (var i = dropDown.children.length - 1; i >= 0; i--) {
            var item = dropDown.children[i];
            item.parentElement.removeChild(item);
        }
    };

    dropdown.createEmptyOption = function (dropdown) {
        return this.createOption(dropdown, this.emptyOptionRaw);
    };

    dropdown.createOption = function (dropdown, name) {
        var newOptionElmt = document.createElement("OPTION");
        newOptionElmt.innerHTML = name;
        dropdown.appendChild(newOptionElmt);
        return newOptionElmt;
    };

    dropdown.getSelected = function (dropDown) {
        for (var i = 0; i < dropDown.children.length; i++) {
            var item = dropDown.children[i];
            if (item.selected) return item;
        }
        return null;
    };

}(window.dropdown = window.dropdown || {}/*, jQuery*/));


(function (main, $, undefined) {

    var shoppingList = document.querySelector("#shoppingList");

    var btnAdd = document.querySelector('#btnAdd');

    var dropDownShoppingLists = document.getElementById('dropDownShoppingLists');

    var btnSaveShoppingList = document.getElementById('btnSaveShoppingList');

    var btnRemoveShoppingList = document.getElementById('btnRemoveShoppingList');

    var btnClearWebStorage = document.getElementById('btnClearWebStorage');
    
    var txtNewItem = document.querySelector('#txtNewItem');
    var txtShoppingListName = document.getElementById('txtShoppingListName');

    main.onDocumentLoaded = function () {
        //shoppingListsStorage.useLocalWebStorage();
        //shoppingListsStorage.useSessionWebStorage();
        var dummyItems = main.createDummys();
        shoppingListsStorage.setItems(dummyItems);

        main.initShoppingLists();

        btnAdd.addEventListener('click', main.onBtnAddItem);

        dropDownShoppingLists.addEventListener('change', () => { main.onChangeShoppingList(); });

        txtShoppingListName.addEventListener('keyup', () => { main.syncBtnCreate(); });

        btnSaveShoppingList.addEventListener('click', main.onAddNewShoppingList);

        btnRemoveShoppingList.addEventListener('click', main.onRemoveShoppingList);

        btnClearWebStorage.addEventListener('click', main.onClearWebStorage);

        main.syncBtnCreate();
    };

    main.onClearWebStorage = function () {
        shoppingListsStorage.clearAll();
        main.initShoppingLists();
        main.removeShoppingListItems(shoppingList.children);
        main.populateShoppingList();
    };

    main.createDummys = function () {

        var items = [];
        items.push({ name: 'foo', items: [{ name: 'a1' }, { name: 'a2' }] });
        items.push({ name: 'bar', items: [{ name: 'a3' }, { name: 'a4' }] });
        return items;
    };

    main.initShoppingLists = function (name) {
        dropdown.clear(dropDownShoppingLists);

        var shoppingLists = shoppingListsStorage.getItems();

        var emptyOption = dropdown.createEmptyOption(dropDownShoppingLists);

        if (shoppingLists) {
            for (var i = 0; i < shoppingLists.length; i++) {
                var shoppingList = shoppingLists[i];
                dropdown.createOption(dropDownShoppingLists, shoppingList.name);
            }
        }

        dropDownShoppingLists.value = emptyOption.innerText;
        if (name) {
            dropDownShoppingLists.value = name;
        }
    };

    main.onBtnAddItem = function () {
        var newItem = txtNewItem.value;

        //if (newItem.length > 0) {
        //    main.addShoppingItem(newItem);
        //}

        /***/
        var selectedShoppingList = dropdown.getSelected(dropDownShoppingLists);
        var items = main.getShoppingListItems(selectedShoppingList.value);
        items.push({ name: newItem });
        shoppingListsStorage.setItem(selectedShoppingList.value, items);
        shoppingListsStorage.logAllShoppingListsToConsole();

        main.onChangeShoppingList();
    };

    main.onRemoveItem = function (li) {
        //li.remove();
        var liInnerText = li.innerHTML;
        var fragsLiInnerText = liInnerText.split("<button");
        var itemName = fragsLiInnerText[0];

        var selectedShoppingList = dropdown.getSelected(dropDownShoppingLists);
        var items = main.getShoppingListItems(selectedShoppingList.value);
        var newItems = [];
        items.forEach((item) => { if (item.name != itemName) { newItems.push(item); } });
        shoppingListsStorage.setItem2(selectedShoppingList.value, newItems);
        shoppingListsStorage.logAllShoppingListsToConsole();
        main.onChangeShoppingList();

        main.syncBtnCreate();
    };

    main.addShoppingItem = function (newItem) {
        var row = listitem.insertItem(newItem);
        row.button.addEventListener("click", () => main.onRemoveItem(row.listitem));
        shoppingList.appendChild(row.listitem);
        main.syncBtnCreate();
    };

    main.syncBtnCreate = function () {

        btnSaveShoppingList.disabled = true;

        btnRemoveShoppingList.disabled = true;
        if (dropDownShoppingLists.value !== dropdown.emptyOption) {
            btnRemoveShoppingList.disabled = false;
        }

        if (shoppingList.childElementCount > 0 && txtShoppingListName.value.length > 0)
        {
            btnSaveShoppingList.disabled = false;
        }
    };

    main.onAddNewShoppingList = function () {
        var name = txtShoppingListName.value;
        var newItems = main.getShoppingLiItems();
        shoppingListsStorage.setItem(name, newItems);
        main.initShoppingLists(name);
    };

    main.getShoppingLiItems = function () {
        var res = [];
        var sList = shoppingList.children;
        for (var i = sList.length - 1; i >= 0; i--) {
            var item = sList[i];
            var contents = item.childNodes.length;
            res.push({ name: item.innerText });
        }
        return res;
    };

    main.onChangeShoppingList = function () {
        main.onChangeShoppingList();
    }

    main.onChangeShoppingList = function (evt) {
        var selected = dropdown.getSelected(dropDownShoppingLists);
        if (selected !== null) {
            main.removeShoppingListItems(shoppingList.children);
            main.populateShoppingList(selected.value);
        }
        main.syncBtnCreate();

        clearInputFields();
    };

    main.removeShoppingListItems = function (sList) {
        for (var i = sList.length - 1; i >= 0; i--) {
            var item = sList[i];
            item.parentNode.removeChild(item);
        }
    };

    main.populateShoppingList = function (shoppingListName) {
        var selectedShoppingItems = main.getShoppingListItems(shoppingListName);
        main.createShoppingListItems(selectedShoppingItems);
    };

    main.getShoppingListItems = function (shoppingListName) {
        var shoppingLists = shoppingListsStorage.getItems();
        var numItems = shoppingLists ? shoppingLists.length : 0;
        if (numItems > 0) {
            for (var i = 0; i < shoppingLists.length; i++) {
                var shoppingListItem = shoppingLists[i];
                if (shoppingListItem.name === shoppingListName) {
                    return shoppingListItem.items;
                }
            }
        }
        return null;
    };

    main.createShoppingListItems = function (shoppingItems) {
        if (shoppingItems !== null) {
            for (var i = 0; i < shoppingItems.length; i++) {
                var shoppingItem = shoppingItems[i];
                main.addShoppingItem(shoppingItem.name);
            }
        }
    };

    main.onRemoveShoppingList = function () {
        var selected = dropdown.getSelected(dropDownShoppingLists);
        shoppingListsStorage.deleteShoppingList(selected.innerText);
        main.initShoppingLists(dropdown.emptyOption);
        main.removeShoppingListItems(shoppingList.children);
        main.populateShoppingList();
    };

    //Private methods
    function clearInputFields() {
        txtNewItem.value = '';
        txtShoppingListName.value = '';
    };

}(window.main = window.main || {}/*, jQuery*/));

main.onDocumentLoaded();

