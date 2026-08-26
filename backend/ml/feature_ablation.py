"""Compare LightGBM performance with different feature groups using 5-fold CV."""
from pathlib import Path
import argparse
import warnings
import numpy as np
import pandas as pd
from lightgbm import LGBMClassifier
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import roc_auc_score, average_precision_score, f1_score, balanced_accuracy_score
from sklearn.model_selection import StratifiedKFold
from sklearn.pipeline import Pipeline

TARGET='multiplesymptoms_case'
ALL=['Q29_Total','Q12_weapon','Q13_feltdie','Q23a_cutdowntime','Q23b_Accomplished_less','Q23c_limited_work','Q23d_difficulty_performing']
GROUPS={
 'all_features':ALL,
 'without_Q29_Total':[c for c in ALL if c!='Q29_Total'],
 'work_function':['Q23a_cutdowntime','Q23b_Accomplished_less','Q23c_limited_work','Q23d_difficulty_performing'],
 'exposure':['Q12_weapon','Q13_feltdie'],
 'Q29_only':['Q29_Total'],
}

def main():
 warnings.filterwarnings('ignore')
 p=argparse.ArgumentParser(); p.add_argument('--data',type=Path,required=True); a=p.parse_args()
 df=pd.read_excel(a.data,engine='openpyxl').replace(['#NULL!','#N/A','NA','N/A',''],np.nan)
 y=pd.to_numeric(df[TARGET],errors='coerce'); keep=y.notna(); y=y[keep].astype(int); df=df.loc[keep]
 cv=StratifiedKFold(n_splits=5,shuffle=True,random_state=42); rows=[]
 for name,features in GROUPS.items():
  features=[c for c in features if c in df.columns]
  fold=[]
  for tr,te in cv.split(df,y):
   pre=ColumnTransformer([('num',SimpleImputer(strategy='median'),features)])
   model=LGBMClassifier(n_estimators=300,learning_rate=.04,num_leaves=15,max_depth=5,class_weight='balanced',random_state=42,verbosity=-1,n_jobs=-1)
   pipe=Pipeline([('preprocess',pre),('model',model)]); pipe.fit(df.iloc[tr][features],y.iloc[tr])
   prob=pipe.predict_proba(df.iloc[te][features])[:,1]; pred=(prob>=.45).astype(int); truth=y.iloc[te]
   fold.append([roc_auc_score(truth,prob),average_precision_score(truth,prob),balanced_accuracy_score(truth,pred),f1_score(truth,pred,zero_division=0)])
  m=np.mean(fold,axis=0); rows.append([name,*m])
 out=pd.DataFrame(rows,columns=['feature_set','roc_auc','avg_precision','balanced_accuracy_at_0.45','f1_at_0.45'])
 print('5-fold feature ablation (threshold 0.45)'); print(out.to_string(index=False,float_format=lambda x:f'{x:.3f}'))

if __name__=='__main__': main()
