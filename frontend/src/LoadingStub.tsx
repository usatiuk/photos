import { Spinner } from "@blueprintjs/core";
import * as React from "react";

export interface ILoadingStubProps {
    spinner?: boolean;
}

export const LoadingStub: React.FunctionComponent<ILoadingStubProps> = (
    props,
) => {
    return <div className="loadingWrapper">{props.spinner && <Spinner />}</div>;
};
