"""Out-of-sample threshold analysis for the LightGBM research baseline.

Thresholds are evaluated only on held-out folds. No production endpoint is changed.
"""
from pathlib import Path
import argparse
import warnings
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import precision_score, recall_score, f1_score, balanced_accuracy_score, average_precision_score
from sklearn.model_selection import StratifiedKFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from lightgbm import LGBMClassifier

BASE = Path(__file__).resolve().parent
FEATURES = ['Q29_Total','Q12_weapon','Q13_feltdie','Q23a_cutdowntime','Q23b_Accomplished_less','Q23c_limited_work','Q23d_difficulty_performing']
TARGET = 'multiplesymptoms_case'
CATS = set()


def load(path):
    df = pd.read_excel(path, engine='openpyxl').replace(['#NULL!','#N/A','NA','N/A',''], np.nan)
    features = [c for c in FEATURES if c in df.columns]
    y = pd.to_numeric(df[TARGET], errors='coerce')
    keep = y.notna()
    return df.loc[keep, features].copy(), y.loc[keep].astype(int), features


def pipeline(features, y):
    num = [c for c in features if c not in CATS]
    pre = ColumnTransformer([('num', SimpleImputer(strategy='median'), num)])
    scale = (len(y)-int(y.sum())) / max(int(y.sum()),1)
    model = LGBMClassifier(n_estimators=300, learning_rate=.04, num_leaves=15, max_depth=5, class_weight='balanced', random_state=42, verbosity=-1, n_jobs=-1)
    return Pipeline([('preprocess',pre),('model',model)])


def main():
    warnings.filterwarnings('ignore')
    p=argparse.ArgumentParser(); p.add_argument('--data',type=Path,required=True); a=p.parse_args()
    X,y,features=load(a.data)
    cv=StratifiedKFold(n_splits=5,shuffle=True,random_state=42)
    thresholds=np.arange(.10,.91,.05)
    rows=[]
    for train_idx,test_idx in cv.split(X,y):
        m=pipeline(features,y.iloc[train_idx]); m.fit(X.iloc[train_idx],y.iloc[train_idx])
        prob=m.predict_proba(X.iloc[test_idx])[:,1]; truth=y.iloc[test_idx]
        for t in thresholds:
            pred=(prob>=t).astype(int)
            rows.append({'threshold':round(float(t),2),'precision':precision_score(truth,pred,zero_division=0),'recall':recall_score(truth,pred,zero_division=0),'f1':f1_score(truth,pred,zero_division=0),'balanced_accuracy':balanced_accuracy_score(truth,pred)})
    out=pd.DataFrame(rows).groupby('threshold').mean().reset_index()
    print('5-fold out-of-sample threshold analysis')
    print(out.to_string(index=False,float_format=lambda x:f'{x:.3f}'))
    print('\nBest by F1:')
    print(out.loc[out['f1'].idxmax()].to_string())
    print('\nBest by balanced accuracy:')
    print(out.loc[out['balanced_accuracy'].idxmax()].to_string())

if __name__=='__main__': main()
