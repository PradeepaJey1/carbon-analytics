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

package org.wso2.carbon.siddhi.editor.core.util.designview.beans.configs.siddhielements.sourcesink;

import org.wso2.carbon.siddhi.editor.core.util.designview.beans.configs.siddhielements.SiddhiElementConfig;
import org.wso2.carbon.siddhi.editor.core.util.designview.beans.configs.siddhielements.sourcesink.mapper.MapperConfig;

import java.util.List;

/**
 * Represents Siddhi Source/Sink
 */
public class SourceSinkConfig extends SiddhiElementConfig {
    private String annotationType;
    private String connectedElementName;
    private String type;
    private List<String> options;
    private MapperConfig map;
    private boolean correlateIdExist;
    private String correlateId;

    public SourceSinkConfig(String annotationType,
                            String connectedElementName,
                            String type,
                            List<String> options, MapperConfig map, boolean correlateIdExist, String correlateId) {
        this.annotationType = annotationType;
        this.connectedElementName = connectedElementName;
        this.type = type;
        this.options = options;
        this.map = map;
        this.correlateIdExist = correlateIdExist;
        this.correlateId = correlateId;

    }

    public String getAnnotationType() {
        return annotationType;
    }

    public String getConnectedElementName() {
        return connectedElementName;
    }

    public String getType() {
        return type;
    }

    public List<String> getOptions() {
        return options;
    }

    public MapperConfig getMap() {
        return map;
    }

    public boolean isCorrelateIdExist() {

        return correlateIdExist;
    }

    public String getCorrelateId() {

        return correlateId;
    }
}