package org.wso2.carbon.notebook.core;

import org.wso2.carbon.ml.commons.domain.SamplePoints;
import org.wso2.carbon.ml.core.exceptions.MLMalformedDatasetException;
import org.wso2.carbon.notebook.commons.constants.MLConstants;
import org.wso2.carbon.notebook.core.util.MLUtils;

import java.util.HashMap;

public class MLDataHolder {
    private static HashMap<MLDataHolderKey, SamplePoints> samplePointsMap;

    public static SamplePoints getSamplePoints(String tableName, int tenantID) throws MLMalformedDatasetException {
        if (samplePointsMap == null) {
            samplePointsMap = new HashMap<MLDataHolderKey, SamplePoints>();
        }

        MLDataHolderKey key = new MLDataHolderKey(tableName, tenantID);
        SamplePoints samplePoints = samplePointsMap.get(key);
        if (samplePoints == null && !samplePointsMap.containsKey(key)) {
            samplePoints = MLUtils.getSampleFromDAS(tableName, MLConstants.SAMPLE_SIZE, tenantID);
            samplePointsMap.put(key, samplePoints);
        }
        return samplePoints;
    }
}
