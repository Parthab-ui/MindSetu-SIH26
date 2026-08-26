"""SHAP-based local/global explanation utility for the LightGBM baseline."""
from pathlib import Path
import argparse
import json
import warnings
import joblib
import numpy as np
import pandas as pd

LABELS={
'Q29_Total':'wellbeing score','Q12_weapon':'weapon exposure indicator','Q13_feltdie':'perceived life-threat indicator',
'Q23a_cutdowntime':'reduced work time','Q23b_Accomplished_less':'accomplished less work',
'Q23c_limited_work':'limited work capacity','Q23d_difficulty_performing':'difficulty performing duties'}

def main():
 warnings.filterwarnings('ignore')
 p=argparse.ArgumentParser(); p.add_argument('--model',type=Path,required=True); p.add_argument('--data',type=Path,required=True); p.add_argument('--row',type=int,default=0); a=p.parse_args()
 try: import shap
 except ImportError: raise SystemExit('SHAP is not installed. Run: python -m pip install shap')
 bundle=joblib.load(a.model); pipe=bundle['pipeline']; features=bundle['features']
 df=pd.read_excel(a.data,engine='openpyxl').replace(['#NULL!','#N/A','NA','N/A',''],np.nan)
 row=df.iloc[[a.row]][features]
 pre=pipe.named_steps['preprocess']; model=pipe.named_steps['model']; transformed=pre.transform(row)
 names=pre.get_feature_names_out(); explainer=shap.TreeExplainer(model); values=explainer.shap_values(transformed)
 if isinstance(values,list): values=values[1]
 vals=np.asarray(values)[0]
 ranked=sorted(zip(names,vals),key=lambda x:abs(float(x[1])),reverse=True)
 prob=float(pipe.predict_proba(row)[0,1]); threshold=0.45
 result={'probability':prob,'threshold':threshold,'signal':'elevated' if prob>=threshold else 'lower','explanation_method':'SHAP TreeExplainer','top_contributors':[{'feature':str(n),'label':LABELS.get(str(n).split('__')[-1],str(n)),'shap_value':round(float(v),5),'direction':'increases signal' if v>0 else 'decreases signal'} for n,v in ranked[:7]]}
 print(json.dumps(result,indent=2))

if __name__=='__main__': main()
