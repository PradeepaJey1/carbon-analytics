/**
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

define(['log', 'jquery', 'lodash', 'sourceOrSinkAnnotation', 'mapAnnotation', 'payloadOrAttribute',
    'jsonValidator', 'handlebar', 'designViewUtils'],
    function (log, $, _, SourceOrSinkAnnotation, MapAnnotation, PayloadOrAttribute, JSONValidator, Handlebars,
        DesignViewUtils) {


        /**
         * @class SinkForm Creates a forms to collect data from a sink
         * @constructor
         * @param {Object} options Rendering options for the view
         */
        var SinkForm = function (options) {
            if (options !== undefined) {
                this.configurationData = options.configurationData;
                this.application = options.application;
                this.formUtils = options.formUtils;
                this.consoleListManager = options.application.outputController;
                var currentTabId = this.application.tabController.activeTab.cid;
                this.designViewContainer = $('#design-container-' + currentTabId);
                this.toggleViewButton = $('#toggle-view-button-' + currentTabId);
                this.dropElement = options.dropElement;
                this.newAgent = options.newAgent;
            }
            var mapperCustOptionList = $('.source-sink-map-options #customized-mapper-options').
                find('.cust-options li');
            if (mapperCustOptionList.length > 0) {
                $('.source-sink-map-options #customized-mapper-options').find('h3').show();
                $('.source-sink-map-options #customized-mapper-options').find('.btn-add-options').html('Add more');
            } else {
                $('.source-sink-map-options #customized-mapper-options').find('h3').hide();
                $('.source-sink-map-options #customized-mapper-options').find('.btn-add-options').
                    html('Add customized option');
            }
        };

        /**
         * Function to validate the predefined options
         * @param {Object} selectedOptions array to add the options which needs to be saved
         * @param {Object} predefinedOptions
         * @param {String} id to identify the div in the html to traverse
         * @return {boolean} isError
         */
        var validateOptions = function (selectedOptions, predefinedOptions, id) {
            var isError = false;
            var option = "";
            $('.source-sink-map-options #' + id + ' .option').each(function () {
                var optionName = $(this).find('.option-name').text().trim();
                var optionValue = $(this).find('.option-value').val().trim();
                var predefined_option_object = getOption(optionName, predefinedOptions);
                if (!predefined_option_object.optional) {
                    if (optionValue == "") {
                        $(this).find('.error-message').text('this option is mandatory');
                        $(this)[0].scrollIntoView();
                        $(this).find('.option-value').addClass('required-input-field');
                        isError = true;
                        return false;
                    } else {
                        var dataType = predefined_option_object.type[0];
                        if (validateDataType(dataType, optionValue)) {
                            $(this).find('.error-message').text('Invalid data-type. ' + dataType + ' required.');
                            $(this)[0].scrollIntoView();
                            $(this).find('.option-value').addClass('required-input-field');
                            isError = true;
                            return false;
                        }
                    }
                    option = optionName + " = '" + optionValue + "'";
                    selectedOptions.push(option);
                } else {
                    if ($(this).find('.option-checkbox').is(":checked")) {
                        if (optionValue == "") {
                            $(this).find('.error-message').text('this option is not filled');
                            $(this)[0].scrollIntoView();
                            $(this).find('.option-value').addClass('required-input-field');
                            isError = true;
                            return false;
                        } else {
                            var dataType = predefined_option_object.type[0];
                            if (validateDataType(dataType, optionValue)) {
                                $(this).find('.error-message').text('Invalid data-type. ' + dataType + ' required.');
                                $(this)[0].scrollIntoView();
                                $(this).find('.option-value').addClass('required-input-field');
                                isError = true;
                                return false;
                            }
                        }
                        option = optionName + " = '" + optionValue + "'";
                        selectedOptions.push(option);
                    }
                }
            });
            return isError;
        };

        /**
         * @function generate form when defining a form
         * @param i id for the element
         * @param formConsole Console which holds the form
         * @param formContainer Container which holds the form
         */
        SinkForm.prototype.generateDefineForm = function (i, formConsole, formContainer, top, left) {
            var self = this;

            // create an empty sink object and add it to the sink array
            var sinkOptions = {};
            _.set(sinkOptions, 'id', i);
            _.set(sinkOptions, 'annotationType', 'SINK');
            _.set(sinkOptions, 'type', undefined);
            _.set(sinkOptions, 'options', undefined);
            _.set(sinkOptions, 'map', undefined);
            var sink = new SourceOrSinkAnnotation(sinkOptions);

            self.configurationData.getSiddhiAppConfig().addSink(sink);
            self.dropElement.generateSinkConnectionElements(self.newAgent,
					editor.getValue().annotationType.name, i, top, left);
            // perform JSON validation
            if (!JSONValidator.prototype.validateSourceOrSinkAnnotation(sink, 'Sink', true)) {
                DesignViewUtils.prototype.errorAlert("To edit sink configuration, please connect to a stream");
                if ($('#' + i).hasClass('error-element')) {
                    $('#' + i).removeClass('error-element');
                }
                $('#' + i).addClass("not-connected-source-sink")
            }

            // close the form window
            self.consoleListManager.removeFormConsole(formConsole);

            self.designViewContainer.removeClass('disableContainer');
            self.toggleViewButton.removeClass('disableContainer');

            return "undefined";
        };

        /**
         * @function generate properties form for a sink
         * @param element selected element(sink)
         * @param formConsole Console which holds the form
         * @param formContainer Container which holds the form
         */
        SinkForm.prototype.generatePropertiesForm = function (element, formConsole, formContainer) {
            var self = this;
            var id = $(element).parent().attr('id');

            // retrieve the source information from the collection
            var clickedElement = self.configurationData.getSiddhiAppConfig().getSink(id);
            var streamList = self.configurationData.getSiddhiAppConfig().getStreamList();
            var connectedElement = clickedElement.connectedElementName;

            if (!clickedElement) {
                var errorMessage = 'unable to find clicked element';
                log.error(errorMessage);
                throw errorMessage;
            }
            var isSinkConnected = true;
            if ($('#' + id).hasClass('error-element') || $('#' + id).hasClass('not-connected-source-sink')) {
                isSinkConnected = false;
                DesignViewUtils.prototype.errorAlert("To edit source configuration, please connect to a stream");
            } else if (!JSONValidator.prototype.validateSourceOrSinkAnnotation(clickedElement, 'Source', true)) {
                // perform JSON validation to check if source contains a connectedElement.
                isSinkConnected = false;
                DesignViewUtils.prototype.errorAlert("To edit source configuration, please connect to a stream");
            }
            if (!isSinkConnected) {
                // close the form window
                self.consoleListManager.removeFormConsole(formConsole);
                self.designViewContainer.removeClass('disableContainer');
                self.toggleViewButton.removeClass('disableContainer');
            } else {
                //remove element error class
                if ($('#' + id).hasClass('not-connected-source-sink')) {
                    $('#' + id).removeClass('not-connected-source-sink');
                }
                var predefined_sinks = this.configurationData.rawExtensions["sink"].sort(sortUsingProperty("name"));
                var predefined_sink_maps = this.configurationData.rawExtensions["sinkMaps"]
                    .sort(sortUsingProperty("name"));
                var streamAttributes = getConnectStreamAttributes(streamList, connectedElement);
                var propertyDiv = $('<div class="source-sink-form-container sink-div"><div id="define-sink"></div>' +
                    '<div class = "source-sink-map-options" id="sink-options-div"></div>' +
                    '<button type="submit" id ="btn-submit" class="btn toggle-view-button"> Submit </button> </div>' +
                    '<div class="source-sink-form-container mapper-div"> <div id="define-map"> </div>' +
                    '<div class="source-sink-map-options" id="mapper-options-div"></div>' +
                    '</div> <div class= "source-sink-form-container attribute-map-div"><div id="define-attribute">' +
                    '</div> <div id="attribute-map-content"></div> </div>');
                formContainer.append(propertyDiv);
                self.designViewContainer.addClass('disableContainer');
                self.toggleViewButton.addClass('disableContainer');

                //declaration of variables
                var sinkOptions = [];
                var sinkOptionsWithValues = [];
                var customizedSinkOptions = [];
                var mapperOptions = [];
                var mapperOptionsWithValues = [];
                var customizedMapperOptions = [];
                var attributes = [];

                //event listener to show option description
                $('.source-sink-map-options').on('mouseover', '.option-desc', function () {
                    $(this).find('.option-desc-content').show();
                });

                //event listener to show option description
                $('.source-sink-map-options').on('mouseout', '.option-desc', function () {
                    $(this).find('.option-desc-content').hide();
                });

                //event listener when the option checkbox is changed
                $('.source-sink-map-options').on('change', '.option-checkbox', function () {
                    if ($(this).is(':checked')) {
                        $(this).parents(".option").find(".option-value").show();
                    } else {
                        $(this).parents(".option").find(".option-value").hide();
                        if ($(this).parents(".option").find(".option-value").hasClass("required-input-field")) {
                            $(this).parents(".option").find(".option-value").removeClass("required-input-field");
                        }
                        $(this).parents(".option").find(".error-message").text("");
                    }
                });

                var custOptDiv = '<li class="option">' +
                    '<div class = "clearfix"> <label>option.key</label> <input type="text" class="cust-option-key"' +
                    'value=""> </div> <div class="clearfix"> <label>option.value</label> ' +
                    '<input type="text" class="cust-option-value" value="">' +
                    '<a class = "btn-del btn-del-option"><i class="fw fw-delete"></i></a></div>' +
                    '<label class = "error-message"></label></li>';

                //onclick to add customized sink option
                $('#sink-options-div').on('click', '#btn-add-sink-options', function () {
                    $('#customized-sink-options .cust-options').append(custOptDiv);
                    changeCustOptDiv();
                });

                //onclick to add customized mapper option
                $('#mapper-options-div').on('click', '#btn-add-mapper-options', function () {
                    $('#customized-mapper-options .cust-options').append(custOptDiv);
                    changeCustOptDiv();
                });

                //onclick to delete customized option
                $('.source-sink-form-container').on('click', '.btn-del-option', function () {
                    $(this).closest('li').remove();
                    changeCustOptDiv();
                });

                //event listener for attribute-map checkbox
                $('#define-attribute').on('change', '#attributeMap-checkBox', function () {
                    if ($(this).is(':checked')) {
                        var attributes = [];
                        if (map !== undefined && map.getPayloadOrAttribute() !== undefined) {
                            attributes = createAttributeObjectList(savedMapperAttributes, streamAttributes);
                        } else {
                            attributes = initialiseAttributeContent(streamAttributes);
                        }
                        $('#attribute-map-content').show();
                        renderAttributeMappingContent(attributes)
                        $('#define-attribute #attributeMap-type').prop('disabled', false);
                    } else {
                        $('#attribute-map-content').hide();
                        $("#define-attribute #attributeMap-type").prop('disabled', 'disabled');
                    }
                });

                //get the clicked element's information
                var type = clickedElement.getType();
                var savedSinkOptions = clickedElement.getOptions();
                var map = clickedElement.getMap();

                //render the template to select the sink type
                var sinkFormTemplate = Handlebars.compile($('#source-sink-map-store-form-template').html());
                var wrappedHtml = sinkFormTemplate({ id: "sink", types: predefined_sinks });
                $('#define-sink').html(wrappedHtml);

                //onchange of the sink-type selection
                $('#sink-type').change(function () {
                    sinkOptions = getSelectedTypeOptions(this.value, predefined_sinks);
                    if (type !== undefined && (type.toLowerCase() == this.value.toLowerCase()) && savedSinkOptions
                        !== undefined) {
                        //if the selected type is same as the saved sink-type
                        sinkOptionsWithValues = mapUserOptionValues(sinkOptions, savedSinkOptions);
                        customizedSinkOptions = getCustomizedOptions(sinkOptions, savedSinkOptions);
                    } else {
                        sinkOptionsWithValues = createOptionObjectWithValues(sinkOptions);
                        customizedSinkOptions = [];
                    }
                    renderOptions(sinkOptionsWithValues, customizedSinkOptions, "sink");
                    if (map === undefined) {
                        renderMap(predefined_sink_maps);
                        customizedMapperOptions = [];
                        mapperOptions = getSelectedTypeOptions("passThrough", predefined_sink_maps);
                        mapperOptionsWithValues = createOptionObjectWithValues(mapperOptions);
                        renderOptions(mapperOptionsWithValues, customizedMapperOptions, "mapper")
                        renderAttributeMapping();
                    }
                });

                // if sink type is defined
                if (type !== undefined) {
                    $('#define-sink').find('#sink-type option').filter(function () {
                        return ($(this).val().toLowerCase() == (type.toLowerCase()));
                    }).prop('selected', true);
                    sinkOptions = getSelectedTypeOptions(type, predefined_sinks);
                    if (savedSinkOptions !== undefined) {
                        //get the savedSourceoptions values and map it
                        sinkOptionsWithValues = mapUserOptionValues(sinkOptions, savedSinkOptions);
                        customizedSinkOptions = getCustomizedOptions(sinkOptions, savedSinkOptions);
                    } else {
                        //create option object with empty values
                        sinkOptionsWithValues = createOptionObjectWithValues(sinkOptions);
                        customizedSinkOptions = [];
                    }
                    renderOptions(sinkOptionsWithValues, customizedSinkOptions, "sink");
                    if (map === undefined) {
                        renderMap(predefined_sink_maps);
                        customizedMapperOptions = [];
                        mapperOptions = getSelectedTypeOptions("passThrough", predefined_sink_maps);
                        mapperOptionsWithValues = createOptionObjectWithValues(mapperOptions);
                        renderOptions(mapperOptionsWithValues, customizedMapperOptions, "mapper")
                        renderAttributeMapping();
                    }
                }

                //if map is defined
                if (map !== undefined) {
                    renderMap(predefined_sink_maps);
                    renderAttributeMapping();
                    var mapperType = map.getType();
                    var savedMapperOptions = map.getOptions();
                    var savedMapperAttributes = map.getPayloadOrAttribute();

                    if (mapperType !== undefined) {
                        $('#define-map').find('#map-type option').filter(function () {
                            return ($(this).val().toLowerCase() == (mapperType.toLowerCase()));
                        }).prop('selected', true);
                        mapperOptions = getSelectedTypeOptions(mapperType, predefined_sink_maps);
                        if (savedMapperOptions !== undefined) {
                            //get the savedMapoptions values and map it
                            mapperOptionsWithValues = mapUserOptionValues(mapperOptions, savedMapperOptions);
                            customizedMapperOptions = getCustomizedOptions(mapperOptions, savedMapperOptions);
                        } else {
                            //create option object with empty values
                            mapperOptionsWithValues = createOptionObjectWithValues(mapperOptions);
                            customizedMapperOptions = [];
                        }
                        renderOptions(mapperOptionsWithValues, customizedMapperOptions, "mapper");
                    }
                    if (savedMapperAttributes !== undefined) {
                        $('#define-attribute #attributeMap-checkBox').prop('checked', true);
                        $('#define-attribute #attributeMap-type').prop('disabled', false);
                        attributes = createAttributeObjectList(savedMapperAttributes, streamAttributes);
                        renderAttributeMappingContent(attributes);
                    }
                }

                //onchange of map type selection
                $('#define-map').on('change', '#map-type', function () {

                    mapperOptions = getSelectedTypeOptions(this.value, predefined_sink_maps);
                    if ((map !== undefined) && (mapperType !== undefined) && (mapperType.toLowerCase() == this
                        .value.toLowerCase()) && savedMapperOptions !== undefined) {
                        //if the selected type is same as the saved map type
                        mapperOptionsWithValues = mapUserOptionValues(mapperOptions, savedMapperOptions);
                        customizedMapperOptions = getCustomizedOptions(mapperOptions, savedMapperOptions);
                    } else {
                        mapperOptionsWithValues = createOptionObjectWithValues(mapperOptions);
                        customizedMapperOptions = [];
                    }
                    renderOptions(mapperOptionsWithValues, customizedMapperOptions, "mapper");
                    if (map === undefined || (map !== undefined && savedMapperAttributes === undefined)) {
                        renderAttributeMapping();
                        attributes = initialiseAttributeContent(streamAttributes)
                    } else if (map !== undefined && savedMapperAttributes !== undefined) {
                        renderAttributeMapping();
                        $('#define-attribute #attributeMap-checkBox').prop('checked', true);
                        attributes = createAttributeObjectList(savedMapperAttributes, streamAttributes);
                    }
                    renderAttributeMappingContent(attributes);
                });

                //onchange of attribute type selection
                $('#define-attribute').on('change', '#attributeMap-type', function () {
                    var attributes = [];
                    if (map !== undefined && savedMapperAttributes !== undefined) {
                        var attributeType = savedMapperAttributes.getType().toLowerCase();
                        var annotationType = savedMapperAttributes.getAnnotationType().toLowerCase();
                        var selAttributeType = "";
                        if ((annotationType === "attributes" && attributeType === "map") ||
                            (annotationType === "attributes" && attributeType === "list")) {
                            selAttributeType = "attributeMap"
                        } else if ((annotationType === "payload" && attributeType === "map")) {
                            selAttributeType = "payloadMap"
                        } else {
                            selAttributeType = "payloadList"
                        }
                    }
                    if (map !== undefined && savedMapperAttributes !== undefined && selAttributeType === this.value) {
                        attributes = createAttributeObjectList(savedMapperAttributes, streamAttributes);
                    } else {
                        attributes = initialiseAttributeContent(streamAttributes);
                    }
                    renderAttributeMappingContent(attributes)
                });

                //onclick of submit
                var submitButtonElement = $(formContainer).find('#btn-submit')[0];
                submitButtonElement.addEventListener('click', function () {

                    //clear the error classes
                    $('.error-message').text("")
                    $('.required-input-field').removeClass('required-input-field');

                    var selectedSinkType = $('#define-sink #sink-type').val();
                    if (selectedSinkType === null) {
                        DesignViewUtils.prototype.errorAlert("Select a sink type to submit");
                        return;
                    } else {
                        var annotationOptions = [];
                        clickedElement.setType(selectedSinkType);
                        if (validateOptions(annotationOptions, sinkOptions, "sink-options")) {
                            return;
                        }
                        if (validateCustomizedOptions(annotationOptions, "sink-options")) {
                            return;
                        }
                        if (annotationOptions.length == 0) {
                            clickedElement.setOptions(undefined);
                        } else {
                            clickedElement.setOptions(annotationOptions);
                        }

                        var selectedMapType = $('#define-map #map-type').val();
                        var mapperAnnotationOptions = [];
                        var mapper = {};
                        _.set(mapper, 'type', selectedMapType);
                        if (validateOptions(mapperAnnotationOptions, mapperOptions, "mapper-options")) {
                            return;
                        }
                        if (validateCustomizedOptions(mapperAnnotationOptions, "mapper-options")) {
                            return;
                        }
                        if (mapperAnnotationOptions.length == 0) {
                            _.set(mapper, 'options', undefined);
                        } else {
                            _.set(mapper, 'options', mapperAnnotationOptions);
                        }

                        if ($('#define-attribute #attributeMap-checkBox').is(":checked")) {
                            //if attribute section is checked
                            var mapperAttributeValuesArray = {};
                            var isError = false;
                            var attributeType;
                            var annotationType;
                            var selAttributeType = $('#define-attribute #attributeMap-type').val();
                            // to identify the selected attribute type and annotation type for attribute-mapper annotation
                            if (selAttributeType === "attributeMap" || selAttributeType === "payloadMap") {
                                attributeType = "MAP";
                                if (selAttributeType === "attributeMap") {
                                    annotationType = "ATTRIBUTES"
                                } else {
                                    annotationType = "PAYLOAD"
                                }
                                //validate attribute value if it is not filled
                                $('#mapper-attributes .attribute').each(function () {
                                    var key = $(this).find('.attr-key').val().trim();
                                    var value = $(this).find('.attr-value').val().trim();
                                    if (value == "") {
                                        $(this).find('.error-message').text('Value is not filled.')
                                        $(this)[0].scrollIntoView();
                                        $(this).find('.attr-value').addClass('required-input-field');
                                        isError = true;
                                        return false;
                                    } else {
                                        mapperAttributeValuesArray[key] = value;
                                    }
                                });
                            } else {
                                var mapperAttributeValuesArray = [];
                                attributeType = "LIST"
                                annotationType = "PAYLOAD"
                                var value = $('#mapper-attributes .attribute .attr-value:first').val().trim();
                                //validate the single payload attribute value if it is empty
                                if (value == "") {
                                    $('#mapper-attributes .attribute .error-message:first').text('Value is not filled.')
                                    $('#mapper-attributes .attribute .attr-value:first')[0].scrollIntoView();
                                    $('#mapper-attributes .attribute .attr-value:first').addClass('required-input-field');
                                    isError = true;
                                } else {
                                    mapperAttributeValuesArray.push(value);
                                }
                            }
                            if (isError) {
                                return;
                            } else {
                                payloadOrAttributeOptions = {};
                                _.set(payloadOrAttributeOptions, 'annotationType', annotationType);
                                _.set(payloadOrAttributeOptions, 'type', attributeType);
                                _.set(payloadOrAttributeOptions, 'value', mapperAttributeValuesArray);
                                var payloadOrAttributeObject = new PayloadOrAttribute(payloadOrAttributeOptions);
                                _.set(mapper, 'payloadOrAttribute', payloadOrAttributeObject);
                            }
                        } else {
                            _.set(mapper, 'payloadOrAttribute', undefined);
                        }
                        var mapperObject = new MapAnnotation(mapper);
                        clickedElement.setMap(mapperObject);
                    }

                    var textNode = $('#' + id).find('.sinkNameNode');
                    textNode.html(selectedSinkType);

                    // set the isDesignViewContentChanged to true
                    self.configurationData.setIsDesignViewContentChanged(true);

                    self.designViewContainer.removeClass('disableContainer');
                    self.toggleViewButton.removeClass('disableContainer');

                    // close the form window
                    self.consoleListManager.removeFormConsole(formConsole);
                });
            }
        };
        return SinkForm;
    });
