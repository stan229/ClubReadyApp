//
//  CalendarManager.m
//  ClubReadyApp
//
//  Created by Stan Bershadskiy on 5/29/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "CalendarManager.h"

@implementation CalendarManager

RCT_EXPORT_MODULE();

-(instancetype) init {
  self = [super init];
  if(self) {
    self.eventStore = [[EKEventStore alloc] init];
    
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    
    // Check if the access granted value for the events exists in the user defaults dictionary.
    if ([userDefaults valueForKey:@"eventkit_events_access_granted"] != nil) {
      // The value exists, so assign it to the property.
      self.eventsAccessGranted = [[userDefaults valueForKey:@"eventkit_events_access_granted"] intValue];
    }
    else{
      // Set the default value.
      self.eventsAccessGranted = NO;
    }
  }
  return self;
}

-(void)setEventsAccessGranted:(BOOL)eventsAccessGranted{
  _eventsAccessGranted = eventsAccessGranted;
  
  [[NSUserDefaults standardUserDefaults] setValue:[NSNumber numberWithBool:eventsAccessGranted] forKey:@"eventkit_events_access_granted"];
}
  
RCT_EXPORT_METHOD(addEvent:(NSString *)name date:(NSDate *)date location:(NSString *)location instructor:(NSString *)instructor) {
  EKEvent *event = [EKEvent eventWithEventStore:self.eventStore];

  NSTimeInterval hourInterval = 60 * 60;

  event.title = name;
  event.calendar = [self.eventStore defaultCalendarForNewEvents];
  event.startDate = date;
  event.endDate = [date dateByAddingTimeInterval:hourInterval];
  event.location = location;
  event.notes = instructor;

  NSTimeInterval offset = -1*60*30;
  EKAlarm *alarm = [EKAlarm alarmWithRelativeOffset:offset];
  [event addAlarm:alarm];
  
  NSError* error;
  
  if([self.eventStore saveEvent:event span:EKSpanFutureEvents commit:YES error:&error]) {
    NSLog(@"Calendar Event Saved successfully");
  } else {
    NSLog(@"ERROR %@", [error localizedDescription]);
  }
}
@end
