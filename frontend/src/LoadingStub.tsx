import { Spinner } from "@blueprintjs/core";
import * as React from "react";

export function LoadingStub() {
    return (
        <div className="loadingWrapper">
            <Spinner />
        </div>
    );
}
