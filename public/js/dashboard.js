var _ENTER_KEYCODE = 13;
var _TAB_KEYCODE = 9;

//  Key-down event for Ingredient Input Box
$("#ingredient-input").on("keydown", function(event) {
  if (event.keyCode === _ENTER_KEYCODE || event.keyCode === _TAB_KEYCODE) {
    event.preventDefault();

    var ingredientInput = $("#ingredient-input");
    var ingredientEntry = ingredientInput.val();

    if (ingredientEntry && ingredientEntry.trim() !== "") {
      var ingredientsList = $("#ingredient-list");

      ingredientsList.append(IngredientBlock(ingredientEntry));
      ingredientInput.val("");

      //  On-Click event for Ingredient Delete Buttons
      $(".ingredient-delete").on("click", function() {
        var thisValue = $(this)
          .attr("id")
          .substr(4);

        $("#" + thisValue).remove();
      });
    }
  }
});

//  On-Click event for the Find Recipes button
$(".getRecipes").on("click", function() {
  var ingredientArray = [];
  var ingredients = $("#ingredient-list").find("span");
  for (var i = 0; i < ingredients.length; i++) {
    var item = ingredients[i];
    ingredientArray.push(item.textContent);
  }

  var queryString = "";
  if (window.document.domain !== "localhost") {
    queryString = window.location.protocol + "//";
  }
  queryString +=
    window.document.domain +
    ":" +
    window.location.port +
    "/api/recipes/" +
    ingredientArray.join("%2C");

  var queryData = {
    dietSpec: "Low-Fat"
  };

  $.get(queryString, queryData, function(data) {
    var numberToPost = 6;
    var divSuggested = $("#suggested-recipes");

    for (var i = 0; i < numberToPost; i++) {
      if (!data[i].recipe) {
        break;
      }

      let currentRecipe = data[i].recipe;
      let newDiv = suggestedBlock(currentRecipe);

      divSuggested.append(newDiv);
    }

    $(".recipe-btn").on("click", function(event) {
      event.preventDefault();

      // Make a newRecipe object
      var newRecipe = {
        link: event.target.getAttribute("value"),
        title: event.target.getAttribute("data-title"),
        uri: event.target.getAttribute("data-uri")
      };

      submitRecipe(newRecipe);
    });
  });
});

function submitRecipe(Recipe) {
  $.post("/api/recipes", Recipe, function(data) {
    console.log(data);
  });
}

/**
 * Blockifies the given recipe from Edamam API for rendering
 * @param {Object} currentRecipe Recipe object from API JSON structure
 */
function suggestedBlock(currentRecipe) {
  let recipeImage = currentRecipe.image;
  let recipeLabel = currentRecipe.label;
  let recipeURI = currentRecipe.uri;
  let recipeLink = currentRecipe.url;
  let newDiv = $("<div>");
  let newImage = $("<img>");
  let newLink = $("<a>");
  let newBreak = $("<br>");
  let newBtn = $(`<a class="button is-small recSavBtn" id="btn2">Save</a>`);

  newBtn.addClass("recipe-btn");
  newBtn.attr("value", recipeLink);
  newBtn.attr("data-title", recipeLabel);
  newBtn.attr("data-uri", recipeURI);
  newBtn.attr("style", "display: flex; float: right;");

  newImage.attr("src", recipeImage);
  newImage.attr("alt", "food picture");
  newImage.attr("style", "display: flex; float: left;");
  newImage.attr("height", "50px").attr("width", "50px");

  newLink.text(recipeLabel);
  newLink.attr("href", recipeLink);
  newLink.attr("style", "margin-top: 10px; font-size: 16px;");
  newLink.attr("target", "_blank");

  newDiv.attr("style", "display: block; margin: 1px 0; clear: both;");
  newDiv.append(newImage);
  newDiv.append(newLink);
  newDiv.append(newBreak);
  newDiv.append(newBtn);
  newDiv.append(newBreak);

  return newDiv;
}

/**
 * Create list item tag for Ingredients entry
 *   Button tag has ID "del-<uniqueID>"
 *   List Item has ID "<uniqueID>"
 * @param {Text} ingredient Text value
 */
function IngredientBlock(ingredient) {
  let blockID = returnDateTimeIdentifier("ingredient");

  var liTag = $("<li>");
  var divTag = $("<div>");
  var spanTag = $("<span>");
  var buttonDelete = $("<button>");

  divTag.addClass("block");
  spanTag.addClass("tag is-info");
  buttonDelete.addClass("delete is-small ingredient-delete");

  liTag.attr("id", blockID);
  spanTag.text(ingredient);
  buttonDelete.attr("id", "del-" + blockID);

  spanTag.append(buttonDelete);
  divTag.append(spanTag);
  liTag.append(divTag);

  return liTag;
}

function savedRecipeBlock(recipeLink, recipeTitle, recipeUri) {
  let blockID = returnDateTimeIdentifier("saved");

  let newDiv = $("<div>");
  let newLink = $("<a>");
  let newBtn = $("<a>");

  newBtn.addClass("delete is-small saved-delete");
  newBtn.attr("value", recipeLink);
  newBtn.attr("style", "display: inline-flex; float: right;");
  newBtn.attr("id", "del-" + blockID);
  newBtn.attr("data-uri", recipeUri);

  newLink.text(recipeTitle);
  newLink.attr("href", recipeLink);
  newLink.attr("style", "margin-top: 10px; font-size: 16px;");
  newLink.attr("target", "_blank");

  //    This is a terrible way to do this. We need to think of something better. -- Done. JA
  newDiv.attr("id", blockID);

  newDiv.append(newLink);
  newDiv.append(newBtn);

  return newDiv;
}

/**
 * Fetches logged-in user's saved recipes
 */
function getSavedRecipes() {
  $.get("/api/recipes/saved", function(data) {
    if (!data) {
      return;
    }
    renderSavedRecipes(data);
  });
}

/**
 * Displays saved recipes to the page
 * @param {Array} recipes DB record array from Recipes table to be displayed
 */
function renderSavedRecipes(recipes) {
  let savedDiv = $("#saved-recipes");
  for (var i = 0; i < recipes.length; i++) {
    let currentLink = recipes[i].link;
    let currentTitle = recipes[i].title;
    let currentUri = recipes[i].uri;
    console.log(currentLink, currentTitle);

    let newBlock = savedRecipeBlock(currentLink, currentTitle, currentUri);
    savedDiv.append(newBlock);
  }

  $(".saved-delete").on("click", function(event) {
    event.preventDefault();
    console.log(event.target);
    let deleteId = $(event.target)
      .attr("id")
      .substr(4);
    let deleteUri = $(event.target).attr("data-uri");
    let queryString = "";
    if (window.document.domain !== "localhost") {
      queryString = window.location.protocol + "//";
    }
    queryString +=
      window.document.domain +
      ":" +
      window.location.port +
      "/api/recipes/delete/" +
      deleteUri;

    console.log(queryString);
    $.post(queryString, function(err) {
      if (err) {
        throw err;
      }
      $("#" + deleteId).remove();
    });
  });
}

//  **  Utility Functions

/**
 * Create unique time-based page ID with the format YYMMDDHHmmssfff
 * @param {Text} prefix Prefix to add before ID
 * @param {Text} suffix Suffix to add after ID
 * @param {Text} separator Separator to delimit prefix and/or suffix
 */
function returnDateTimeIdentifier(prefix = "", suffix = "", separator = "-") {
  let newDate = new Date();
  let identifier =
    newDate
      .getFullYear()
      .toString()
      .substr(2) +
    newDate.getMonth() +
    newDate.getDate() +
    newDate.getHours() +
    newDate.getMinutes() +
    newDate.getSeconds() +
    newDate.getMilliseconds();

  if (prefix) {
    identifier = prefix + separator + identifier;
  }
  if (suffix) {
    identifier += separator + suffix;
  }
  return identifier;
}

//  **  Logic

$(document).ready(function() {
  getSavedRecipes();
});
