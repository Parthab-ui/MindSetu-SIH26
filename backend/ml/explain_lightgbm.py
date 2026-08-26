"""Generate human-readable feature contributions for a LightGBM prediction.

This is an explainability aid, not a clinical diagnosis or causal explanation.
"""
from pathlib import Path
import argparse
import json
import numpy as np
import pandas as pd
import joblib

FEATURES = ['Q29_Total','Q12_weapon','Q13_feltdie','Q23a_cutdowntime','Q23b_Accomplished_less','Q23c_limited_work','Q23d_difficulty_performing']
LABELS = {
    'Q29_Total':'wellbeing score',
    'Q12_weapon':'weapon exposure indicator',
    'Q13_feltdie':'perceived life-threat indicator',
    'Q23a_cutdowntime':'reduced work time',
    'Q23b_Accomplished_less':'accomplished less work',
    'Q23c_limited_work':'limited work capacity',
    'Q23d_difficulty_performing':'difficulty performing duties',
}

def main():
    p=argparse.ArgumentParser(); p.add_argument('--model',type=Path,required=True); p.add_argument('--data',type=Path,required=True); p.add_argument('--row',type=int,default=0); a=p.parse_args()
    bundle=joblib.load(a.model)
    pipe=bundle['pipeline']; features=bundle['features']; target=bundle['target']
    df=pd.read_excel(a.data,engine='openpyxl').replace(['#NULL!','#N/A','NA','N/A',''],np.nan)
    row=df.iloc[[a.row]][features].copy()
    prob=float(pipe.predict_proba(row)[0,1]); threshold=0.45
    model=pipe.named_steps['model']; transformed=pipe.named_steps['preprocess'].transform(row)
    # Tree SHAP is optional; fall back to split gain importance for a robust demo.
    try:
        import shap
        explainer=shap.TreeExplainer(model)
        values=explainer.shap_values(transformed)
        vals=values[1][0] if isinstance(values,list) else values[0]
        names=pipe.named_steps['preprocess'].get_feature_names_out()
        ranked=sorted(zip(names,vals),key=lambda x:abs(float(x[1])),reverse=True)[:7]
        method='SHAP'
    except Exception:
        names=pipe.named_steps['preprocess'].get_feature_names_out()
        importances=model.feature_importances_
        ranked=sorted(zip(names,importances),key=lambda x:float(x[1]),reverse=True)[:7]
        method='model feature importance'
    result={'probability':prob,'threshold':threshold,'signal':'elevated' if prob>=threshold else 'lower','explanation_method':method,'top_features':[{'feature':str(n),'label':LABELS.get(str(n).split('__')[-1],str(n)),'score':float(v)} for n,v in ranked]}
    print(json.dumps(result,indent=2))

if __name__=='__main__': main()
