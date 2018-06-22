/*
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

package org.wso2.carbon.siddhi.editor.core.util.designview.codegenerator.generators.query.subelements;

import org.wso2.carbon.siddhi.editor.core.util.designview.beans.configs.siddhielements.query.QueryOrderByConfig;
import org.wso2.carbon.siddhi.editor.core.util.designview.codegenerator.generators.SubElementCodeGenerator;
import org.wso2.carbon.siddhi.editor.core.util.designview.constants.SiddhiCodeBuilderConstants;
import org.wso2.carbon.siddhi.editor.core.util.designview.exceptions.CodeGenerationException;

import java.util.List;

/**
 * Generate's the code for sub-elements of a Siddhi query
 */
public class QuerySubElementCodeGenerator {

    public static String generateQueryGroupBy(List<String> groupByList) {
        if (groupByList == null || groupByList.isEmpty()) {
            return SiddhiCodeBuilderConstants.EMPTY_STRING;
        }

        return SiddhiCodeBuilderConstants.GROUP +
                SiddhiCodeBuilderConstants.SPACE +
                SiddhiCodeBuilderConstants.BY +
                SiddhiCodeBuilderConstants.SPACE +
                SubElementCodeGenerator.generateParameterList(groupByList);
    }

    public static String generateQueryOrderBy(List<QueryOrderByConfig> orderByList) throws CodeGenerationException {
        if (orderByList == null || orderByList.isEmpty()) {
            return SiddhiCodeBuilderConstants.EMPTY_STRING;
        }

        StringBuilder orderByListStringBuilder = new StringBuilder();
        orderByListStringBuilder.append(SiddhiCodeBuilderConstants.ORDER)
                .append(SiddhiCodeBuilderConstants.SPACE)
                .append(SiddhiCodeBuilderConstants.BY)
                .append(SiddhiCodeBuilderConstants.SPACE);

        int orderByAttributesLeft = orderByList.size();
        for (QueryOrderByConfig orderByAttribute : orderByList) {
            if (orderByAttribute == null) {
                throw new CodeGenerationException("A given query 'order by' value is empty");
            } else if (orderByAttribute.getValue() == null || orderByAttribute.getValue().isEmpty()) {
                throw new CodeGenerationException("The 'value' attribute for a given query order by element is empty");
            }

            orderByListStringBuilder.append(orderByAttribute.getValue());
            if (orderByAttribute.getOrder() != null && !orderByAttribute.getOrder().isEmpty()) {
                orderByListStringBuilder.append(SiddhiCodeBuilderConstants.SPACE)
                        .append(orderByAttribute.getOrder());
            }

            if (orderByAttributesLeft != 1) {
                orderByListStringBuilder.append(SiddhiCodeBuilderConstants.COMMA);
            }
            orderByAttributesLeft--;
        }

        return orderByListStringBuilder.toString();
    }

    public static String generateQueryLimit(long limit) {
        if (limit != 0) {
            return SiddhiCodeBuilderConstants.LIMIT +
                    SiddhiCodeBuilderConstants.SPACE +
                    limit;
        }
        return SiddhiCodeBuilderConstants.EMPTY_STRING;
    }

    public static String generateQueryHaving(String having) {
        if (having == null || having.isEmpty()) {
            return SiddhiCodeBuilderConstants.EMPTY_STRING;
        }

        return SiddhiCodeBuilderConstants.HAVING +
                SiddhiCodeBuilderConstants.SPACE +
                having;
    }

    public static String generateQueryOutputRateLimit(String outputRateLimit) {
        if (outputRateLimit == null || outputRateLimit.isEmpty()) {
            return SiddhiCodeBuilderConstants.EMPTY_STRING;
        }

        return SiddhiCodeBuilderConstants.OUTPUT +
                SiddhiCodeBuilderConstants.SPACE +
                outputRateLimit;
    }

    private QuerySubElementCodeGenerator() {
    }
}
