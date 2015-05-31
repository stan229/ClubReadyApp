//
//  CalendarManager.h
//  ClubReadyApp
//
//  Created by Stan Bershadskiy on 5/29/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "RCTBridge.h"
@import EventKit;

@interface CalendarManager : NSObject <RCTBridgeModule>

@property (nonatomic, strong) EKEventStore *eventStore;
@property (nonatomic) BOOL eventsAccessGranted;

@end
