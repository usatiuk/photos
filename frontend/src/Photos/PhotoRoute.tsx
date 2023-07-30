import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Photo } from "./Photo";

function getId(props: RouteComponentProps) {
    return parseInt((props.match?.params as { id: string }).id);
}

export const PhotoRouteComponent: React.FunctionComponent<
    RouteComponentProps
> = (props: RouteComponentProps) => {
    const id = getId(props);

    return <Photo id={id} close={() => {}} />;
};

export const PhotoRoute = withRouter(PhotoRouteComponent);
