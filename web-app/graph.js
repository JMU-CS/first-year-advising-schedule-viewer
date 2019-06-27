const WEST_BLUESTONE = "West Bluestone";
const BLUESTONE = "Bluestone";
const SOUTH_HIGH_GRACE = "South High St./Grace St.";
const CENTRAL = "Central Campus";
const NORTH = "North Campus";
const LOWER_SKYLINE = "Lower Skyline";
const UPPER_SKYLINE = "Upper Skyline";
const LAKESIDE = "Lakeside";
var buildings_to_areas = {
    // West Bluestone
    "Estes":WEST_BLUESTONE,
    "Anthony-Seeger":WEST_BLUESTONE,
    "Duke":WEST_BLUESTONE,
    "Roberts":WEST_BLUESTONE,
    "Music":WEST_BLUESTONE,
    "Cleveland":WEST_BLUESTONE,
    // Bluestone
    "Wayland":BLUESTONE,
    "Hoffman":BLUESTONE,
    "Ashby":BLUESTONE,
    "Johnston":BLUESTONE,
    "Harrison":BLUESTONE,
    "Jackson":BLUESTONE,
    "Roop":BLUESTONE,
    "Moody":BLUESTONE,
    "Miller":BLUESTONE,
    "Maury":BLUESTONE,
    "Spotswood":BLUESTONE,
    "Sheldon":BLUESTONE,
    "Alumnae":BLUESTONE,
    "Wilson":BLUESTONE,
    "Burruss":BLUESTONE,
    "Carrier":BLUESTONE,
    "Keezell":BLUESTONE,
    // South High St./Grace St.
    "Grace":SOUTH_HIGH_GRACE,
    "Studio":SOUTH_HIGH_GRACE,
    "Memorial":SOUTH_HIGH_GRACE,
    // Central Campus
    "Grafton-Stovall":CENTRAL,
    "D-Hall":CENTRAL,
    
    // North Campus
    "Student":NORTH,
    "Health":NORTH,
    // Lower Skyline
    "Biotechnology":LOWER_SKYLINE,
    "ISAT/CS":LOWER_SKYLINE,
    "Physics/Chemistry":LOWER_SKYLINE,
    "Engineering/Geosciences":LOWER_SKYLINE,
    "UREC":LOWER_SKYLINE,
    // Upper Skyline
    "Festival":UPPER_SKYLINE,
    "Rose":UPPER_SKYLINE,
    "E-Hall":UPPER_SKYLINE,
    // Lakeside
    "Godwin":LAKESIDE,
    "Plecker":LAKESIDE,
    "Showker":LAKESIDE,
};
var area_walk_graph = {};
area_walk_graph[WEST_BLUESTONE] = [WEST_BLUESTONE,BLUESTONE,NORTH,SOUTH_HIGH_GRACE];
area_walk_graph[BLUESTONE] = [BLUESTONE,WEST_BLUESTONE, SOUTH_HIGH_GRACE, NORTH, CENTRAL, LAKESIDE];
area_walk_graph[SOUTH_HIGH_GRACE] = [SOUTH_HIGH_GRACE,WEST_BLUESTONE,BLUESTONE,NORTH];
area_walk_graph[CENTRAL] = [CENTRAL,BLUESTONE,NORTH,LAKESIDE,LOWER_SKYLINE];
area_walk_graph[NORTH] = [NORTH,SOUTH_HIGH_GRACE,WEST_BLUESTONE,BLUESTONE,CENTRAL];
area_walk_graph[LOWER_SKYLINE] = [LOWER_SKYLINE,LAKESIDE,CENTRAL,UPPER_SKYLINE];
area_walk_graph[UPPER_SKYLINE] = [UPPER_SKYLINE,LOWER_SKYLINE];
area_walk_graph[LAKESIDE] = [LAKESIDE,BLUESTONE, CENTRAL, LOWER_SKYLINE];

function areaForRoom(room) {
    return buildings_to_areas[room.split(" ")[0]];
}
function walkable(room1, room2) {
    return area_walk_graph[areaForRoom(room1)].indexOf(areaForRoom(room2)) >= 0;
}