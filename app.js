
let budgetController = (function(){
    let Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calculatePercentage = function(totalIncome){
        if(totalIncome>0)
            this.percentage = Math.round((this.value / totalIncome)*100);
        else this.percentage = -1;
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    let Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let calculateTotal = function(type){
        let sum = data.allItems[type].reduce(function(sum, current){
            return sum + current.value;
        },0);

        data.totals[type] = sum;
        
    }

    let data = {
        allItems: {
            inc: [],
            exp: [],
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val){
            let newItem, ID;

            //Create new ID
            if(data.allItems[type].length <= 0) ID = 0;
            else 
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

            //Create new item based on inc or exp type
            if(type === 'exp')
                newItem = new Expense(ID,des,val);
            else if(type ==='inc')
                newItem = new Income(ID,des,val);

            //Push it into our data structure
            data.allItems[type].push(newItem);
           
            //return the object contain new element
            return newItem;
        },
        calculateBudget: function(){
            // Calculate total income  and expenses

            calculateTotal('inc');
            calculateTotal('exp');

            // Caculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
 
            // Caculate the percentage of income that we spent
            if(data.totals.inc > 0)
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            else data.percentage = -1;

        },
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(current){
                current.calculatePercentage(data.totals.inc);
            })
        },
        getPercentages: function(){
            let allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        deleteItem: function(type,id){
            let ids, index;

            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
        },
        testing: function(){
            console.log(data);
        }
    };

})();


let UIController = (function(){

    let DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    let formatNumber = function(num, type){
        let numSplit, int, dec;

        num = Math.abs(num).toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        // function return number fortmat
        function numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        if(int.length > 3){
            int = numberWithCommas(int);
            
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    let nodeListForEach = function(list,callback){
        for (let index = 0; index < list.length; index++) {
            callback(list[index],index);
        }
    };

    return {
        getInput: function(){
            return{
                type: document.querySelector(DOMStrings.inputType).value, // will be inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        getDOMStrings: function(){
            return DOMStrings;
        },

        addListItem: function(obj, type){
            let html, newhtml, element;

            // Create HTML string with placeholder text
            if (type === 'inc'){
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-{{id}}"><div class="item__description">{{description}}</div><div class="right clearfix"><div class="item__value">{{value}}</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i> </button></div></div></div>';
            } else if(type === 'exp'){
                element = DOMStrings.expenseContainer;
                html = ' <div class="item clearfix" id="exp-{{id}}"><div class="item__description">{{description}}</div><div class="right clearfix"><div class="item__value">{{value}}</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
             // Replace the placeholder text with some actual data
             newhtml = html.replace('{{id}}',obj.id);
             newhtml = newhtml.replace('{{description}}',obj.description);
             newhtml = newhtml.replace('{{value}}', formatNumber(obj.value, type));

            // Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newhtml);

        }, 

        // Clear the fields
        clearFields: function(){
            let fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(element => {
                element.value = "";
            });

            fieldsArr[0].focus();
        },
        // Display budget
        displayBudget: function(obj){
            let type;
            obj.budget >= 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0)
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + ' %';
            else 
                document.querySelector(DOMStrings.percentageLabel).textContent =  '---';

        },
        deleteListItem: function(selectorID){
            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        displayPercentages: function(percentages){
            let fields = document.querySelectorAll(DOMStrings.expensePercLabel);

           

            nodeListForEach(fields,function(current,index){
                if(percentages[index] > 0)
                    current.textContent = percentages[index] + ' %';
                else 
                    current.textContent =  '---';
            });
        }, 
        displayDate: function(){
            let now = new Date();
            document.querySelector(DOMStrings.dateLabel).textContent = now.toLocaleDateString("en-GB");
        },
        changedType: function(){
            let fields = document.querySelectorAll(DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            })

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');

        }

    }

})();


//GLOBAL APP CONTROLLER
let controller = (function(budgetCtrl,UICtrl){

    let setupEventListeners = function(){

        let DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress',function(event){

            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    let updateBudget = function(){
        //1. Caculate budget
        budgetCtrl.calculateBudget();

        //2. Return the budget
        let budget = budgetCtrl.getBudget();

        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);
        
    };
  
    let updatePercentages = function(){
        //1. Caculate percentages
        budgetCtrl.calculatePercentages();

        //2. Read percentages from the budget controller
        let percentages = budgetCtrl.getPercentages();

        //3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    let ctrlAddItem = function(){
        let inputData, newItem;
        //1. Get the field input data
        inputData = UICtrl.getInput();
        if(inputData.description === "" || isNaN(inputData.value)) return;

        //2. Add the item to the budget controller
        newItem = budgetController.addItem(inputData.type, inputData.description, inputData.value)

        //3. Add the item to the UI
        UICtrl.addListItem(newItem, inputData.type);

        //4. Clear the fields
        UICtrl.clearFields();

        //5. Caculate and update budget
        updateBudget();

        //6. Caculate and update percentages
        updatePercentages();

    };

    let ctrlDeleteItem = function(event){
        let itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
            
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            //2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            //3. Update and show the new budget
            updateBudget();

            //4. Caculate and update percentages
            updatePercentages();
        }
    }
    
    return {
        init: function(){
            console.log("Application has started!");
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
            setupEventListeners();
        }
    };

})(budgetController,UIController);

controller.init();