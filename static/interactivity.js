// File implements: data visualization, form validation, search prevention, prevention of opening new page by hitting key Enter

// When button "search" is clicked,
// 1) load tweets, 2) create a bar chart, 3) create a calendar
$(document).ready(function() {

    $("#search").on("click", function() {

        /// Check if search btn is disabled
        if ($("#search").is(":disabled")) {
            return;
        }

        // Call fn loadTweets. Pass anonymous fn to loadTweets for manipulaiting the received data
        loadTweets(function(jsonTweets) {

            // If received error, 1) disable "search" to force user to reload the page, 2) show #error
            if ("error" in jsonTweets) {
                $("#search").prop('disabled', true);
                $("#error-code").html(jsonTweets.error.code);
                $("#error-message").html(jsonTweets.error.message);
                $("#error").show();
                return;
            }

            makeBarChart(jsonTweets.statistics_timeline);

            makeCalendar(jsonTweets.tweets_data);

            // Disable search button and inputs to prevent rendering new charts over existing ones
            $("#search").prop('disabled', true);
            $("#screen_name").prop('disabled', true);
            $("#limit").prop('disabled', true);
        });
    });


    // Get the nested JSON object from /search route
    // 1) Enforce number to be positive integer, 2) go to /search route, pass it screen_name and limit,
    // 3) receive JSON object for charts, 4) return it as a callback fn's argument
    // json = { "statistics_timeline": [{"sentiment": str, "amount": int}, ...],
    //          "tweets_data": <tweets_data> }
    // tweets_data = [ {"date": str, "score": int, "positive_tokens": int, "negative_tokens": int, "text": str}, ...]
    function loadTweets(callback) {
        var checkedLimit = Math.abs(parseInt($("#limit").val(), 10));
        $.getJSON("/search?screen_name=" + $("#screen_name").val() + "&limit="+ checkedLimit, function(json){
            return callback(json);
        });
    }


    // Create a barchart via 3d.js
    // Based on bar chart by Marcos Iglesias: https://bl.ocks.org/Golodhros/6f8e6d1792416ee3770ff4ddd5c9594e
    function makeBarChart(data) {
        // Add text to div
        d3.select("#barChartDiv")
            .insert("p", ":first-child")
                .attr("class", "chart-text")
                .text("Amount of positive, negative and neutral tweets");

        // Set canvas for barChart
        var outerWidth = 500,
            outerHeight = 400,
            margin = {top: 20, right: 20, bottom: 20, left: 40},
            innerWidth  = outerWidth  - margin.left - margin.right,
            innerHeight = outerHeight - margin.top  - margin.bottom;

        var svg = d3.select("#barChart")
            .attr("width", outerWidth)
            .attr("height", outerHeight);

        // Set scales for barChart axes
        var x = d3.scaleBand()
            .rangeRound([0, innerWidth])
            .padding(0.1)
            .domain(data.map(function(d) { return d.sentiment; }));

        var y = d3.scaleLinear()
            .rangeRound([innerHeight, 0])
            .domain([0, d3.max(data, function(d) { return d.amount; })]);

        // Create a <g> item to group all the visual elements of barChart
        var g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Render axisX
        g.append("g")
            .attr("class", "axisX")
            .attr("transform", "translate(0," + innerHeight + ")")
            .call(d3.axisBottom(x));

        // Render axisY
        g.append("g")
            .attr("class", "axisY")
            .call(d3.axisLeft(y)
              .ticks(5));

        // Render bars and use different colors that represent positive, negative and neutral sentiment
        var bar = g.selectAll("rect")
          .data(data)
          .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.sentiment); })
            .attr("y", function(d) { return y(d.amount); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return innerHeight - y(d.amount); })
            .attr("rx", 4).attr("ry", 4) // rounded corners
            .attr("fill", function(d) {
                if (d.sentiment == "positive") {
                    return "rgb(47, 152, 79)"; // green
                } else if (d.sentiment == "negative") {
                    return "rgb(239, 69, 51)"; // red
                } else {
                    return "rgb(230, 222, 197)"; // beige
                }
            });

        // Apply tooltips with amount of tweets to each bar
        bar.append("title")
            .text(function(d) { return d.amount});
    }


    // Create a heatmap calendar that represents emotional coloring for each day of month.
    // Color intensity for each square represents total emotional score of the day.
    // Based on heatmap calendar of Dan Joseph: https://bl.ocks.org/danbjoseph/13d9365450c27ed3bf5a568721296dcc
     function makeCalendar(data) {

        // Add text to div
        d3.select("#calendarDiv")
            .insert("p", ":first-child") // ??
                .attr("class", "chart-text")
                .text("Calendar of user's emotions");

        // Create a variable that stores a function for calculating amount of weeks in concrete month
        var weeksInMonth = function(month) {
            var m = d3.timeMonth.floor(month);
            return d3.timeWeeks(d3.timeWeek.floor(m), d3.timeMonth.offset(m,1)).length;
        };

        // Find min and max dates in dataset
        var minDate = d3.min(data, function(d) { return new Date(d.date); });
        var maxDate = d3.max(data, function(d) { return new Date(d.date); });

        // Set values for square cell that will represent a day calendar
        var cellMargin = 4,
            cellSize = 20;

        // Set accessors for different parts of date object
        var day = d3.timeFormat("%w"),
            week = d3.timeFormat("%U"),
            format = d3.timeFormat("%Y-%m-%d"),
            titleFormat = d3.utcFormat("%a, %d-%b"),
            monthName = d3.timeFormat("%B"),
            year = d3.timeFormat("%Y")
            months= d3.timeMonth.range(d3.timeMonth.floor(minDate), maxDate);

        // Create svg selection for representing months
        var svg = d3.select("#calendar")
            .selectAll("svg")
            .data(months)
            .enter().append("svg")
                .attr("class", "month")
                .attr("height", ((cellSize * 7) + (cellMargin * (7+1)) + 30) ) // 30px is for month labels // ??? 20px - old
                .attr("width", function(d) {
                    var columns = weeksInMonth(d);
                    return ((cellSize * columns) + (cellMargin * (columns + 1)));
                })
                .append("g");

        // Create labels for each month and put them to the last tag inside var svg (<g>)
        svg.append("text")
            .attr("class", "month-name")
            .attr("y", (cellSize * 7) + (cellMargin * (7+1)) + 15 ) // 15px is to locate label 15px upper the lower <svg> border
            .attr("x", function(d) {
                var columns = weeksInMonth(d);
                return (((cellSize * columns) + (cellMargin * (columns + 1))) / 2);
            })
            .attr("text-anchor", "middle")
            .text(function(d) { return monthName(d) + " " + year(d); });

        // Create selections of <rect> selections to represent days inside each <svg> tag
        var rect = svg.selectAll("rect.day")
            .data(function(d, i) {
              return d3.timeDays(d, d3.timeMonth.offset(d, 1)) ;
            })
            .enter().append("rect")
                .attr("class", "day")
                .attr("width", cellSize)
                .attr("height", cellSize)
                .attr("rx", 3).attr("ry", 3) // rounded corners
                .attr("fill", '#eaeaea') // default grey fill
                .attr("y", function(d) {
                    return (day(d) * cellSize) + (day(d) * cellMargin) + cellMargin;
                })
                .attr("x", function(d) {
                    var weekIndexInMonth = (week(d) - week(d3.timeMonth.floor(d)));
                    return (weekIndexInMonth * cellSize) + (weekIndexInMonth * cellMargin) + cellMargin;
                })
                .datum(format);

        // Apply tooltip (date in format "%a, %d-%b". Ex.: "Sat, 28-Sep") to each <rect> tag. It also creates tag <title>.
        rect.append("title")
            .text(function(d) { return titleFormat(new Date(d)); });

        // Create a var that stores info about dates' total emotional score.
        // Total score is sum of all emotional scores of tweets that were posted the same day
        // dateScoreSum is: {date0: totalDayScore0, date1: totalDayScore1...}
        var dateScoreSum = d3.nest()
            .key(function(d) { return format(new Date(d.date)); }) // ???
            .rollup(function(leaves) {
                return d3.sum(leaves, function(d){ return d.score; });
            })
            .object(data);

        // Create a scale to map data.scores with colors of different intensity, that fill rectangles (days).
        // Colors represent intensity of positive or negative emotions, the max value of range is the same for positive and negative.
        // 1) Find max absolute value of score inside data array. 2) Set a domain of intensity for colors in calendar
        var max_score = d3.max(data, function(d) { return Math.abs(d.score); });
        var scale = d3.scaleLinear()
            .domain([-max_score, max_score])
            .range([0,1]);

        // Apply color to rects that are present in dateScoreSum. Change titles to show the day's score on hover
        var coloredRect = rect.filter(function(d) { return d in dateScoreSum; })
            .style("fill", function(d) {
                if (dateScoreSum[d] > 0 ) {
                    return d3.interpolateGreens(scale(dateScoreSum[d]));
                } else if (dateScoreSum[d] < 0 ) {
                    return d3.interpolateReds(scale(Math.abs(dateScoreSum[d])));
                } else {
                    return "rgb(230, 222, 197)"; // beige
                }
            })
            .select("title")
            .text(function(d) { return titleFormat(new Date(d)) + ":  " + dateScoreSum[d]; });
    }

});


// "keyup" event handler for form validation and search prevention
// If any input is invalid: disable search button, output error text under invalid input
// If both inputs are valid, enable search button and change error text.

$("input").keyup(function() {

    var invalidScreenName = false;
    var invalidLimit = false;

    if ($("#screen_name").val().length == 0) {
        invalidScreenName = true;
    } else if ($("#screen_name").val() == "@") {
        invalidScreenName = false;
    } else {
        invalidScreenName = false;
    }

    var limitVal = $("#limit").val();
    if (limitVal.length == 0 || limitVal < 1 || limitVal > 300 || (parseFloat(limitVal) - parseInt(limitVal)) !=0) {
        invalidLimit = true;
    } else {
        invalidLimit = false;
    }

    // Define which input was changed. Modify helper text under this input
    var target = $( event.target );
        if (target.is("#screen_name") ) {
            if (invalidScreenName) {
                $("#validate-screen_name").attr("class", "form-text text-danger")
                $("#validate-screen_name").html("Please input a username");
            } else {
                $("#validate-screen_name").attr("class", "form-text text-success")
                $("#validate-screen_name").html("");
            }
        } else {
            if (invalidLimit) {
                $("#validate-limit").attr("class", "form-text text-danger")
                $("#validate-limit").html("Please input a number from 1 to 300");
            } else {
                $("#validate-limit").attr("class", "form-text text-success")
                $("#validate-limit").html("Looks good!");
            }
        }

    // Disable search if any of input fields is invalid. Otherwise enable
    if (invalidScreenName || invalidLimit || ($("#screen_name").val() === "@")) {
        $("#search").attr("disabled", true);
    } else {
        $("#search").removeAttr("disabled");
    }

});


// Disable form submission by key "Enter" - to prevent opening the new window for charts
// https://medium.com/@uistephen/keyboardevent-key-for-cross-browser-key-press-check-61dbad0a067a
document.addEventListener('keydown', function (event) {
    var key = event.key || event.keyCode;
    if (key === 'Enter' || key === 13) {
        event.preventDefault();
    }
});