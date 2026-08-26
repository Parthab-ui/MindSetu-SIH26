"""Train and save the selected LightGBM baseline for the research outcome.

This remains a research prototype: multiplesymptoms_case is not an SIH26186
LOW/MODERATE/HIGH label and is not a clinical/operational decision model.
"""
from pathlib import Path
import argparse
import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import classification_report, confusion_matrix, average_precision_score, roc_auc_score, f1_score, balanced_accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from lightgbm import LGBMClassifier

BASE=Path(__file__).resolve().parent
DEFAULT_DATA=BASE/"data"/"sri_lanka_navy_follow_up.xlsx"
DEFAULT_MODEL=BASE/"lightgbm_multiplesymptoms.joblib"
TARGET="multiplesymptoms_case"
FEATURES=["Q29_Total","Q12_weapon","Q13_feltdie","Q23a_cutdowntime","Q23b_Accomplished_less","Q23c_limited_work","Q23d_difficulty_performing"]

def load(path):
    df=pd.read_excel(path,engine="openpyxl").replace(["#NULL!","#N/A","NA","N/A",""],np.nan)
    features=[c for c in FEATURES if c in df.columns]
    y=pd.to_numeric(df[TARGET],errors="coerce")
    keep=y.notna()
    return df.loc[keep,features].copy(),y.loc[keep].astype(int),features

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("--data",type=Path,default=DEFAULT_DATA); ap.add_argument("--model",type=Path,default=DEFAULT_MODEL); args=ap.parse_args()
    X,y,features=load(args.data)
    Xtr,Xte,ytr,yte=train_test_split(X,y,test_size=.2,stratify=y,random_state=42)
    pos=int(ytr.sum()); neg=len(ytr)-pos
    pre=ColumnTransformer([("num",SimpleImputer(strategy="median"),features)])
    clf=LGBMClassifier(n_estimators=300,learning_rate=.04,num_leaves=15,max_depth=5,class_weight="balanced",random_state=42,verbosity=-1,n_jobs=-1)
    pipe=Pipeline([("preprocess",pre),("model",clf)])
    pipe.fit(Xtr,ytr)
    p=pipe.predict_proba(Xte)[:,1]; pred=(p>=.5).astype(int)
    print(f"Rows: {len(y)} | Train: {len(ytr)} | Test: {len(yte)}")
    print(f"Features: {features}")
    print(f"ROC-AUC: {roc_auc_score(yte,p):.3f}")
    print(f"PR-AUC: {average_precision_score(yte,p):.3f}")
    print(f"Balanced accuracy: {balanced_accuracy_score(yte,pred):.3f}")
    print(f"F1: {f1_score(yte,pred,zero_division=0):.3f}")
    print("Classification report:"); print(classification_report(yte,pred,zero_division=0))
    print("Confusion matrix:"); print(confusion_matrix(yte,pred))
    args.model.parent.mkdir(parents=True,exist_ok=True)
    joblib.dump({"pipeline":pipe,"features":features,"target":TARGET,"threshold":.5},args.model)
    print(f"Saved model: {args.model}")
    print("Feature importance:")
    for name,imp in sorted(zip(features,clf.feature_importances_),key=lambda x:x[1],reverse=True): print(f"  {name}: {imp:.1f}")
if __name__=="__main__": main()
