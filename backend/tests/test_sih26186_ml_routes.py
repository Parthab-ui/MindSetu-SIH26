import pytest
from pydantic import ValidationError
from sih26186_ml_routes import SIH26186MLRequest

def test_ml_request_valid():
    request = SIH26186MLRequest(
        Q29_Total=17.0,
        Q12_weapon=0.0,
        Q13_feltdie=0.0,
        Q23a_cutdowntime=0.0,
        Q23b_Accomplished_less=0.0,
        Q23c_limited_work=0.0,
        Q23d_difficulty_performing=0.0
    )
    assert request.Q29_Total == 17.0

def test_ml_request_q29_total_out_of_bounds_low():
    with pytest.raises(ValidationError):
        SIH26186MLRequest(
            Q29_Total=16.0,
            Q12_weapon=0.0,
            Q13_feltdie=0.0,
            Q23a_cutdowntime=0.0,
            Q23b_Accomplished_less=0.0,
            Q23c_limited_work=0.0,
            Q23d_difficulty_performing=0.0
        )

def test_ml_request_q29_total_out_of_bounds_high():
    with pytest.raises(ValidationError):
        SIH26186MLRequest(
            Q29_Total=86.0,
            Q12_weapon=0.0,
            Q13_feltdie=0.0,
            Q23a_cutdowntime=0.0,
            Q23b_Accomplished_less=0.0,
            Q23c_limited_work=0.0,
            Q23d_difficulty_performing=0.0
        )

def test_ml_request_binary_out_of_bounds():
    with pytest.raises(ValidationError):
        SIH26186MLRequest(
            Q29_Total=50.0,
            Q12_weapon=2.0,
            Q13_feltdie=0.0,
            Q23a_cutdowntime=0.0,
            Q23b_Accomplished_less=0.0,
            Q23c_limited_work=0.0,
            Q23d_difficulty_performing=0.0
        )
