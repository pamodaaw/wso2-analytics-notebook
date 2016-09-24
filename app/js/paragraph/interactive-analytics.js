/**
 * Interactive analytics paragraph client prototype
 *
 * @param {jQuery} paragraph The paragraph in which the client resides in
 * @constructor
 */
function InteractiveAnalyticsParagraphClient(paragraph) {
    var self = this;
    var utils = new Utils();
    var paragraphUtils = new ParagraphUtils(paragraph);
    var timeFrom;
    var timeTo;
    var searchByAndMaxResultCountContainer;
    var timeRangeContainer;
    var queryContainer;

    self.type = constants.paragraphs.interactiveAnalytics.key;
    self.unsavedContentAvailable = false;

    /**
     * Initialize the interactive analytics paragraph
     * If content is passed into this the source content will be set from it
     *
     * @param {Object} [content] Source content of the paragraph encoded into an object
     */
    self.initialize = function(content) {
        searchByAndMaxResultCountContainer =
            paragraph.find('.search-by-container, .maximum-result-count-container');
        timeRangeContainer = paragraph.find('.time-range-container');
        queryContainer = paragraph.find('.query-container');

        paragraphUtils.loadTableNames(function() {
            // Load source content
            if (content != undefined) {
                // Loading the source content from the content object provided
                if (content.inputTable != undefined) {
                    paragraph.find('.input-table').val(content.inputTable);
                    onInputTableChange();
                    if (content.searchMethod != undefined) {
                        paragraph.find('input[value=' + content.searchMethod + ']').prop('checked', true);
                        switch (content.searchMethod) {
                            case 'query' :
                                onSearchByQueryRadioButtonClick();
                                if (content.query != undefined) {
                                    paragraph.find('.query').val(content.query);
                                }
                                break;
                            case 'time-range' :
                                onSearchByTimeRangeRadioButtonClick();
                                if (content.timeFrom != undefined && content.timeTo != undefined) {
                                    timeFrom = content.timeFrom;
                                    timeTo = content.timeTo;
                                }
                                break;
                            default :
                                onSearchByQueryRadioButtonClick();
                                content.searchMethod = 'query';
                        }
                    }
                }
            }

            // Adding the date pickers. Content needed to be loaded before this
            var dateRangePickerOptions = {
                timePicker: true,
                autoApply: true,
                timePicker24Hour: true,
                drops: 'up'
            };
            if (timeFrom != undefined) {
                dateRangePickerOptions.startDate = new Date(timeFrom);
            }
            if (timeTo != undefined) {
                dateRangePickerOptions.endDate = new Date(timeTo);
            }
            paragraph.find('.time-range').daterangepicker(dateRangePickerOptions, function(start, end) {
                self.unsavedContentAvailable = true;
                timeFrom = new Date(start).getTime();
                timeTo = new Date(end).getTime();
            });
        });

        // Registering event listeners
        paragraph.find('.input-table').change(function() {
            self.unsavedContentAvailable = true;
            onInputTableChange();
        });

        paragraph.find('.search-by-time-range').click(function() {
            self.unsavedContentAvailable = true;
            onSearchByTimeRangeRadioButtonClick();
        });

        paragraph.find('.search-by-query').click(function() {
            self.unsavedContentAvailable = true;
            onSearchByQueryRadioButtonClick();
        });

        var maxResultCount = paragraph.find('.maximum-result-count');
        maxResultCount.focusout(function() {
            if (maxResultCount.val() == '') {
                maxResultCount.val(1000);
            }
        });

        paragraph.find('.query').keyup(function() {
            self.unsavedContentAvailable = true;
        });

        /**
         * Run input table change tasks
         */
        function onInputTableChange() {
            var searchMethod = paragraph.find('input[name=search-by-option]:checked').val();
            switch (searchMethod) {
                case 'time-range' :
                    timeRangeContainer.slideUp(function() {
                        searchByAndMaxResultCountContainer.slideDown();
                    });
                    break;
                case 'query' :
                    queryContainer.slideUp(function() {
                        searchByAndMaxResultCountContainer.slideDown();
                    });
                    break;
                default :
                    searchByAndMaxResultCountContainer.slideDown();
            }
            paragraph.find('input[name=search-by-option]').prop('checked', false);
            paragraph.find('.run-paragraph-button').prop('disabled', false);
        }

        /**
         * Run search method changing to time range tasks
         */
        function onSearchByTimeRangeRadioButtonClick() {
            queryContainer.slideUp();
            timeRangeContainer.slideDown();
        }

        /**
         * Run search method changing to query tasks
         */
        function onSearchByQueryRadioButtonClick() {
            timeRangeContainer.slideUp();
            queryContainer.slideDown();
        }
    };

    /**
     * Run the interactive analytics paragraph
     *
     * @param {Object[]} [paragraphsLeftToRun] The array of paragraphs left to be run in run all paragraphs task
     */
    self.run = function(paragraphsLeftToRun) {
        var tableName = paragraph.find('.input-table').val();
        utils.showLoadingOverlay(paragraph);
        $.ajax({
            type: 'GET',
            url: constants.API_URI + 'tables/' + tableName + '/columns',
            success: function(response) {
                if (response.status == constants.response.SUCCESS) {
                    var columns = response.columnNames;
                    columns.push('_timestamp');
                    columns.push('_version');
                    var searchMethod = paragraph.find('input[name=search-by-option]:checked').val();
                    var queryParameters = {
                        tableName: tableName
                    };

                    if (searchMethod == 'time-range') {
                        queryParameters.timeFrom = timeFrom;
                        queryParameters.timeTo = timeTo;
                    } else if (searchMethod == 'query') {
                        queryParameters.query = paragraph.find('.query').val();
                    } else {
                        searchMethod = 'query';
                        queryParameters.query = '';
                    }

                    paragraphUtils.setOutput(utils.generateDataTableWithLazyLoading(
                        'POST',
                        constants.API_URI + 'interactive-analytics/search/' + searchMethod,
                        queryParameters,
                        columns,
                        paragraph.find('.maximum-result-count').val()
                    ));
                } else if (response.status == constants.response.NOT_LOGGED_IN) {
                    window.location.href = 'sign-in.html';
                } else {
                    paragraphUtils.handleNotification('error', 'Error', response.message);
                }
                utils.hideLoadingOverlay(paragraph);
            },
            error: function(response) {
                paragraphUtils.handleNotification(
                    'error', 'Error', utils.generateErrorMessageFromStatusCode(response.readyState)
                );
                utils.hideLoadingOverlay(paragraph);
            }
        });
        paragraphUtils.runNextParagraphForRunAllTask(paragraphsLeftToRun);
    };

    /**
     * Get the source content of the paragraph encoded into an object
     *
     * @return {Object} source content of the paragraph encoded into an object
     */
    self.getSourceContent = function() {
        var content;
        var inputTable = paragraph.find('.input-table').val();
        if (inputTable != undefined) {
            content = { inputTable: inputTable };
            var searchMethod = paragraph.find('input[name=search-by-option]:checked').val();
            if (searchMethod != undefined) {
                content.searchMethod = searchMethod;
                var maxResultCount = paragraph.find('maximum-result-count').val();
                if (maxResultCount != undefined) {
                    content.maxResultCount = maxResultCount;
                }
                switch (searchMethod) {
                    case 'query' :
                        var query = paragraph.find('.query').val();
                        if (query != undefined) {
                            content.query = query;
                        }
                        break;
                    case 'time-range' :
                        if (timeFrom != undefined && timeTo != undefined) {
                            content.timeFrom = timeFrom;
                            content.timeTo = timeTo;
                        }
                        break;
                }
            }
        }
        return content;
    };
}   // End of InteractiveAnalyticsParagraphClient prototype constructor
