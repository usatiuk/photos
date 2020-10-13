import "./Photos.scss";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IAppState } from "~redux/reducers";

export interface IOverviewComponentProps {
    fetching: boolean;
    spinner: boolean;

    fetchPhotos: () => void;
}

export function OverviewComponent() {
    return <div id="overview">Overview!</div>;
}

function mapStateToProps(state: IAppState) {
    return {};
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {};
}

export const Overview = connect(
    mapStateToProps,
    mapDispatchToProps,
)(OverviewComponent);
